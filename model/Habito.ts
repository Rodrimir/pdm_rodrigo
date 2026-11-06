import { AvatarHabito } from './AvatarHabito';

// Modelo do hábito: cada conta tem um por vez, com um avatar, um nome e um horário fixo
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
