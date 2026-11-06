import { AvatarHabito } from './AvatarHabito';

export class Habito {
  constructor(
    public uid: string,
    public avatar: AvatarHabito,
    public nome: string,
    public horario: string,
  ) {
    this.uid = uid;
    this.avatar = avatar;
    this.nome = nome;
    this.horario = horario;
  }
}
