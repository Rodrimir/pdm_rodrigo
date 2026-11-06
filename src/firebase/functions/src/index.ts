// Cloud Functions do pdm-exemplo-expo: código que roda no SERVIDOR do
// Firebase, não no app. Usa o Admin SDK, que tem a credencial do próprio
// projeto: não passa pelas regras de segurança e pode enviar mensagens
// pelo FCM (Firebase Cloud Messaging) — por isso o envio fica aqui, e
// nunca no app.

import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { setGlobalOptions } from 'firebase-functions';
import * as logger from 'firebase-functions/logger';
import { onSchedule } from 'firebase-functions/v2/scheduler';

initializeApp();

// Mesma região do Firestore (o gatilho do banco precisa estar nela) e,
// para controlar custos, no máximo 10 instâncias ao mesmo tempo.
setGlobalOptions({ region: 'southamerica-east1', maxInstances: 10 });

// Erros do FCM que indicam que o token não vale mais (app desinstalado,
// token expirado etc.). Esses tokens são apagados do Firestore.
const TOKEN_INVALIDO = [
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
];

// O fuso do usuário é salvo como "UTC-3", "UTC-4" ou "UTC-5" (Fuso.ts), não
// como nome IANA — por isso o deslocamento é aplicado manualmente, sem Intl.
function offsetEmHorasDoFuso(fuso?: string): number {
  const offset = Number(fuso?.replace('UTC', ''));
  return Number.isFinite(offset) ? offset : -3; // sem fuso salvo: assume Brasília
}

// "HH:MM" no fuso do usuário, para comparar com o horário salvo em habitos.
function horarioAtualNoFuso(fuso?: string): string {
  const agora = new Date();
  const minutosUtc = agora.getUTCHours() * 60 + agora.getUTCMinutes();
  const minutosNoFuso = minutosUtc + offsetEmHorasDoFuso(fuso) * 60;
  const minutosDoDia = ((minutosNoFuso % 1440) + 1440) % 1440; // sempre positivo
  const hora = Math.floor(minutosDoDia / 60);
  const minuto = minutosDoDia % 60;
  return `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
}

// AGENDADA: roda a cada minuto e dispara a notificação para quem tem o
// horário do hábito batendo com o horário atual NO FUSO do usuário — por
// isso não dá para comparar direto com a hora do servidor (sempre UTC).
export const notificarHorarioDoHabito = onSchedule('every 1 minutes', async () => {
  const db = getFirestore();
  const habitos = await db.collection('habitos').get();
  if (habitos.empty) return;

  const lote = db.batch();
  let enviados = 0;

  // Um hábito por usuário (o id do doc em habitos É o uid do usuário —
  // ver HabitoProvider.tsx), então dá para buscar o token FCM direto.
  for (const habitoDoc of habitos.docs) {
    const habito = habitoDoc.data();
    const usuarioRef = db.collection('usuarios').doc(habitoDoc.id);
    const usuarioSnap = await usuarioRef.get();
    const tokenFcm = usuarioSnap.get('token_fcm');
    if (!tokenFcm || habito.horario !== horarioAtualNoFuso(usuarioSnap.get('fuso'))) {
      continue;
    }

    try {
      await getMessaging().send({
        token: tokenFcm,
        notification: {
          title: `Hora de: ${habito.nome}`,
          body: 'Faça seu hábito agora :)',
        },
        data: { rota: 'habito' },
        // Mesmo canal criado no app (app/index.tsx)
        android: { priority: 'high', notification: { channelId: 'padrao' } },
      });
      enviados++;
    } catch (erro: any) {
      if (TOKEN_INVALIDO.includes(erro.code)) {
        lote.update(usuarioRef, { token_fcm: FieldValue.delete() });
      } else {
        logger.error(`Falha ao notificar o hábito de ${habitoDoc.id}.`, erro);
      }
    }
  }

  logger.info(`Notificações de hábito enviadas: ${enviados}.`);
  await lote.commit();
});
