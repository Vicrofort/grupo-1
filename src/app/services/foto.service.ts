import { Injectable } from '@angular/core';
import { Camera, CameraPhoto, CameraResultType, CameraSource, Photo } from '@capacitor/camera'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Storage } from '@capacitor/storage'
import { Foto } from '../models/foto.interface'
import { WebView } from '@capacitor/core';
import { __awaiter } from 'tslib';

@Injectable({
  providedIn: 'root'
})
export class FotoService {

  //almacenar Footos

  public fotos: Foto[] = [];
  private PHOTO_STORAGE: string = "fotos"

  constructor() { }

  public async addNewToGallery() {
    //tomar Foto
    const fotoCapturada = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100

    })

    /* this.fotos.unshift({
       filepath: "foto_",
       webviewPath: fotoCapturada.webPath!
     })*/

    const savedImageFile = await this.savePicture(fotoCapturada)
    this.fotos.unshift(savedImageFile)

    Storage.set({
      key:this.PHOTO_STORAGE,
      value: JSON.stringify (this.fotos)
    })
  }

  public async savePicture(cameraPhoto: CameraPhoto) {
    //convertir la forto a formato base64id
    const base64Data = await this.readAsBase64(cameraPhoto)
    //escribir la foto en el directorio
    const fileName = new Date().getTime + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    })

    return {

      filepath: fileName,
      webviewPath: cameraPhoto.webPath

    }
  }

  public async readAsBase64(cameraPhoto: CameraPhoto) {
    //convertir de blob a Base64
    const response = await fetch(cameraPhoto.webPath!)
    const blob = await response.blob()

    return await this.convertBlobToBase64(blob) as string
  }

  convertBlobToBase64 = (Blob: Blob) => new Promise((resole, reject) => {

    const reader = new FileReader
    reader.onerror = reject
    reader.onload = () => {
      resole(reader.result)
    }
    reader.readAsDataURL(Blob)
  })

  public async loadSaved() {
    // recuperar fotos en cache
    const listaFotos = await Storage.get({ key: this.PHOTO_STORAGE });
    this.fotos = JSON.parse(listaFotos?.value ?? '[]');
  
    // desplegar las fotos en base64
    for (let foto of this.fotos) {
      // leer cada foto almacenada en el filesystem
      const readFile = await Filesystem.readFile({
        path: foto.filepath,
        directory: Directory.Data,
      });
    }
  }
}

