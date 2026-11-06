// Avatares que podem ser escolhidos para o hábito
export enum AvatarHabito {
  gotinha = 'Gotinha',
  livrinho = 'Livrinho',
  trino = 'Trino',
}

// Imagem de cada avatar
export const imagensAvatar = {
  [AvatarHabito.gotinha]: require('../assets/images/5normalgotinha.png'),
  [AvatarHabito.livrinho]: require('../assets/images/5normallivrinho.png'),
  [AvatarHabito.trino]: require('../assets/images/5normaltrino.png'),
};
