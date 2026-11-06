import { Fuso } from './Fuso';
import { Idioma } from './Idioma';
import { Tema } from './Tema';

// Modelo do usuário: a senha só é usada no cadastro e nunca é salva no Firestore
export class Usuario {
  constructor(
    public uid: string,
    public email: string,
    public nome: string,
    public urlFoto: string,
    public idioma: Idioma,
    public tema: Tema,
    public fuso: Fuso,
    public senha?: string,
  ) {
    this.uid = uid;
    this.email = email;
    this.nome = nome;
    this.urlFoto = urlFoto;
    this.idioma = idioma;
    this.tema = tema;
    this.fuso = fuso;
    this.senha = senha;
  }
}
