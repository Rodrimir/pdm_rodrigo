import { AvatarHabito } from './AvatarHabito';

export class Execucao {
  constructor(
    public uid: string,
    public uidUsuario: string,
    public avatar: AvatarHabito,
    public quantidade: number,
    public dataHora: Date,
  ) {
    this.uid = uid;
    this.uidUsuario = uidUsuario;
    this.avatar = avatar;
    this.quantidade = quantidade;
    this.dataHora = dataHora;
  }
}
