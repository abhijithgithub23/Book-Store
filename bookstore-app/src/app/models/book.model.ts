export interface Book {
  id: string; 
  title: string;
  author: string;
  coverUrl: string;
}

export interface BookDetails extends Book {
  description: string;
  publishYear: string;
  subjects?: string[]; 
}