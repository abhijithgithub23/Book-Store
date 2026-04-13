export interface Book {
  id: string; // The Work ID (e.g., OL12345W)
  title: string;
  author: string;
  coverUrl: string;
}

export interface BookDetails extends Book {
  description: string;
  publishYear: string;
  subjects?: string[]; 
}