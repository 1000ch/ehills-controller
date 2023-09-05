import process from 'node:process';
import bolt from '@slack/bolt';
import {registerVisitor} from './ehills.js';
import {visitorRegistration, valueOf, selectedDatetimeOf} from './slack-modal.js';

// Initialize app with bot token and signing secret
const app = new bolt.App({
  // AppToken is required to enable socket mode
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.command(visitorRegistration.command, async ({ack, body, client}) => {
  await ack();

  try {
    const modalConfig = visitorRegistration.getModalConfig(body.trigger_id);
    await client.views.open(modalConfig);
  } catch (error) {
    console.error(error);
  }
});

app.view(visitorRegistration.callbackId, async ({ack, view, client}) => {
  await ack();

  try {
    const visitorCompany = valueOf(view, 'visitor-company');
    const visitorName = valueOf(view, 'visitor-name');
    const visitorCount = valueOf(view, 'visitor-count');
    const visitDatetimeSeconds = selectedDatetimeOf(view, 'visit-datetime');
    const visitDatetime = new Date(visitDatetimeSeconds * 1000);
    const registerDivision = valueOf(view, 'register-division');
    const registerName = valueOf(view, 'register-name');

    const text = await registerVisitor({
      visitorCompany,
      visitorName,
      visitorCount,
      visitDatetime,
      registerDivision,
      registerName,
    });

    const name = `${visitorCompany} ${visitorName}`;
    const month = `${visitDatetime.getMonth() + 1}`.padStart(2, '0');
    const date = `${visitDatetime.getDate()}`.padStart(2, '0');
    const hour = `${visitDatetime.getHours()}`.padStart(2, '0');
    const minute = `${visitDatetime.getMinutes()}`.padStart(2, '0');
    const number = text?.match(/\d+/)?.at(0);
    const message = number ? `入館番号は ${number} です。` : '';

    await client.chat.postMessage({
      channel: 'C055SNF0W49',
      text: `${name}さんの ${visitDatetime.getFullYear()}-${month}-${date} ${hour}:${minute} の入館予約を受付ました。${message}`,
    });
  } catch (error) {
    console.error(error);
  }
});

await app.start(process.env.PORT ?? 3000);
