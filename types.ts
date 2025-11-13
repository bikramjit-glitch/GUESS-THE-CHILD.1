export enum AppState {
  Upload,
  Generating,
  Presenting,
}

export interface Person {
  id: string;
  childhoodPhoto: File;
  currentPhoto: File;
  childhoodPhotoPreview: string;
  currentPhotoPreview: string;
  caption?: string; // Caption is added after generation
}
