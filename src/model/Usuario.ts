import { Idioma } from './Idioma';
import { Tema } from './Tema';

export class Usuario {
  public uid: string;
  public email: string;
  public nome: string;
  public urlFoto: string;
  public idioma: Idioma;
  public tema: Tema;
  public senha?: string;
  constructor(
    uid: string,
    email: string,
    nome: string,
    urlFoto: string,
    idioma: Idioma,
    tema: Tema,
    senha?: string,
  ) {
    this.uid = uid;
    this.email = email;
    this.nome = nome;
    this.urlFoto = urlFoto;
    this.idioma = idioma;
    this.tema = tema;
    this.senha = senha;
  }
}
