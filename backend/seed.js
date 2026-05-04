require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const GENRES = ['fiction', 'fantasy', 'romance', 'science_fiction', 'thriller', 'mystery'];
const BOOKS_PER_GENRE = 100;

// Helper to prevent hitting OpenLibrary rate limits
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to safely extract text from OpenLibrary objects
const extractText = (data) => {
  if (!data) return null;
  if (typeof data === 'string') return data;
  if (data.value) return data.value;
  return null;
};

async function createTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS books (
      id VARCHAR(100) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      genre VARCHAR(50) NOT NULL,
      publish_year VARCHAR(20) NOT NULL,
      cover_url TEXT,
      description TEXT NOT NULL,
      author_name VARCHAR(255) NOT NULL,
      author_bio TEXT NOT NULL,
      subjects TEXT[]
    );
  `;
  await client.query(query);
  console.log('✅ God Table "books" is ready.');
}

async function fetchAuthorDetails(authorKey) {
  try {
    const res = await fetch(`https://openlibrary.org${authorKey}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    
    const bio = extractText(data.bio);
    const name = data.name || data.personal_name;
    
    if (!bio || !name) return null; // Enforce strict rule: Must have author details
    
    return { name, bio };
  } catch (error) {
    return null;
  }
}

async function fetchWorkDetails(workKey) {
  try {
    const res = await fetch(`https://openlibrary.org${workKey}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    
    const description = extractText(data.description);
    if (!description) return null; // Enforce strict rule: Must have description
    
    return {
      description,
      subjects: data.subjects ? data.subjects.slice(0, 10) : []
    };
  } catch (error) {
    return null;
  }
}

async function seedDatabase() {
  try {
    await client.connect();
    console.log('🔗 Connected to PostgreSQL.');
    await createTable();

    for (const genre of GENRES) {
      console.log(`\n📚 Starting fetching for genre: ${genre.toUpperCase()}`);
      let booksAdded = 0;
      let offset = 0;

      // Keep fetching until we hit 100 valid books for this genre
      while (booksAdded < BOOKS_PER_GENRE) {
        // Fetch a large batch of popular books in this genre
        const searchUrl = `https://openlibrary.org/subjects/${genre}.json?limit=50&offset=${offset}`;
        const res = await fetch(searchUrl);
        const data = await res.json();

        if (!data.works || data.works.length === 0) {
          console.log(`⚠️ Ran out of books for ${genre}. Stopping at ${booksAdded}.`);
          break;
        }

        for (const work of data.works) {
          if (booksAdded >= BOOKS_PER_GENRE) break;

          const workKey = work.key;
          const title = work.title;
          const publishYear = work.first_publish_year?.toString();
          const coverUrl = work.cover_id ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg` : null;
          const authorKey = work.authors && work.authors.length > 0 ? work.authors[0].key : null;

          // Initial Filter: Check basic data availability
          if (!title || !publishYear || !coverUrl || !authorKey) {
             continue; // Skip: Missing core data
          }

          await delay(200); // Be polite to the API
          
          // Fetch Deep Details
          const workDetails = await fetchWorkDetails(workKey);
          if (!workDetails) continue; // Skip: Missing description
          
          await delay(200);

          const authorDetails = await fetchAuthorDetails(authorKey);
          if (!authorDetails) continue; // Skip: Missing author name or bio

          // All conditions met! Insert into God Table
          const id = workKey.replace('/works/', '');
          const query = `
            INSERT INTO books (id, title, genre, publish_year, cover_url, description, author_name, author_bio, subjects)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO NOTHING;
          `;
          
          const values = [
            id, title, genre, publishYear, coverUrl, 
            workDetails.description, authorDetails.name, authorDetails.bio, workDetails.subjects
          ];

          await client.query(query, values);
          booksAdded++;
          console.log(`[${genre.toUpperCase()}] (${booksAdded}/${BOOKS_PER_GENRE}) Added: ${title}`);
        }
        
        offset += 50; // Move to the next page of OpenLibrary results
      }
    }

    console.log('\n🎉 Seeding Complete! 600 books successfully stored.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await client.end();
  }
}

seedDatabase();