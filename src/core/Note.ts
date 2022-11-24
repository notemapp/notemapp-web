export interface Note {
  id: string;
  title: string;
  createdOn: string;
  modifiedOn: string;
  syncProgress: number|null;
}