declare module "libheif-js" {
  export class HeifDecoder {
    decode(data: Uint8Array): HeifImage[];
  }

  export interface HeifImage {
    get_width(): number;
    get_height(): number;
    display(imageData: ImageData, callback: (result: boolean) => void): void;
  }
}
