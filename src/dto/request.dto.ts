export interface RequestDto {
  headers: {
    authentication?: string;
    token?: string;
    username?: string;
  };
  body: any;
  files: any;
}
