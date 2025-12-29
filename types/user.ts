export interface User {
  id: string;
  name: string;
  email: string;
  bioAge: number;
  chronologicalAge: number;
  lastTestDate?: Date;
  nextTestDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

