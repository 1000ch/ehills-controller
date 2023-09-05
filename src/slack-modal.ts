import type {ViewOutput} from '@slack/bolt';
import type {Block, KnownBlock, ViewsOpenArguments} from '@slack/web-api';

export function valueOf(output: ViewOutput, actionId: string): string {
  const values = Object.values(output.state.values);
  const value = values.find(v => v[actionId])?.[actionId].value;

  if (!value) {
    throw new Error(`value for ${actionId} is falsy`);
  }

  return value;
}

export function selectedDatetimeOf(output: ViewOutput, actionId: string): number {
  const values = Object.values(output.state.values);
  const value = values.find(v => v[actionId])?.[actionId].selected_date_time;

  if (!value) {
    throw new Error(`value for ${actionId} is falsy`);
  }

  return value;
}

const visitorCompany: Block | KnownBlock = {
  type: 'input',
  element: {
    type: 'plain_text_input',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    action_id: 'visitor-company',
    placeholder: {
      type: 'plain_text',
      text: '株式会社●●',
    },
  },
  label: {
    type: 'plain_text',
    text: '訪問者の会社名',
  },
};

const visitorName: Block | KnownBlock = {
  type: 'input',
  element: {
    type: 'plain_text_input',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    action_id: 'visitor-name',
    placeholder: {
      type: 'plain_text',
      text: '○○○○',
    },
  },
  label: {
    type: 'plain_text',
    text: '訪問者の名前',
  },
};

const visitorCount: Block | KnownBlock = {
  type: 'input',
  element: {
    type: 'number_input',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    is_decimal_allowed: false,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    action_id: 'visitor-count',
  },
  label: {
    type: 'plain_text',
    text: '訪問者の数',
  },
};

const visitDatetime: Block | KnownBlock = {
  type: 'input',
  element: {
    type: 'datetimepicker',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    action_id: 'visit-datetime',
  },
  label: {
    type: 'plain_text',
    text: '訪問日時',
  },
};

const registerDivision: Block | KnownBlock = {
  type: 'input',
  element: {
    type: 'plain_text_input',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    action_id: 'register-division',
    placeholder: {
      type: 'plain_text',
      text: '○○○○部',
    },
  },
  label: {
    type: 'plain_text',
    text: '登録者の部署',
  },
};

const registerName: Block | KnownBlock = {
  type: 'input',
  element: {
    type: 'plain_text_input',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    action_id: 'register-name',
    placeholder: {
      type: 'plain_text',
      text: '○○○○',
    },
  },
  label: {
    type: 'plain_text',
    text: '登録者の名前',
  },
};

export const visitorRegistration = {
  command: '/visitor_registration',
  callbackId: 'visitor_registration_modal',
  getModalConfig(triggerId: string): ViewsOpenArguments {
    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      trigger_id: triggerId,
      view: {
        type: 'modal',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        callback_id: this.callbackId as string,
        title: {
          type: 'plain_text',
          text: 'Visitor Registration',
        },
        submit: {
          type: 'plain_text',
          text: 'Submit',
        },
        blocks: [
          visitorCompany,
          visitorName,
          visitorCount,
          visitDatetime,
          registerDivision,
          registerName,
        ],
      },
    };
  },
};
