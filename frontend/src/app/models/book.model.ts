export interface Book {
  id: string; 
  title: string;
  author: string;
  coverUrl: string;
  publishYear?: string; 
  genre?: string;
}

export interface BookDetails extends Book {
  description: string;
  publishYear: string;
  subjects?: string[]; 
  authorBio?: string;
}