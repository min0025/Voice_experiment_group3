// 印象評価課題の共通手順を説明ページで再利用するためのHTML断片です。
const voice_task_steps_html = `
  <ol style="font-size: 18px; line-height: 1.9; padding-left: 1.8em; margin: 0 0 28px 0;">
    <li style="margin-bottom: 18px;">
      実験が開始されると、画面に再生ボタンが表示されます。再生ボタンをクリックすると、音声が流れます。<u><b>音声は最後まで注意して聞いてください。</b></u>
    </li>
    <li style="margin-bottom: 18px;">
      音声の再生が終わると、<b><u>音声の印象に関する6つの項目の設問（Q1）</u></b>および<b><u>想起する人物像に関する2つの設問（Q2~Q3）</u></b>が表示されます。すべての項目に回答してください。
    </li>
    <li style="margin-bottom: 18px;">
      すべての項目に回答すると「次へ」ボタンが押せるようになります。準備が出来次第ボタンをクリックして次の音声に進んでください。
    </li>
    <li style="margin-bottom: 22px;">
      音声は、全部で<b><u>25回</u></b>聞いていただきます。すべての音声について評価が終わると「お疲れ様でした」という案内画面が表示されます。
    </li>
  </ol>
`;

// 本実験の概要と全画面化の予告を出す最初の説明ページです。
const experiment_notice = {
  type: jsPsychFullscreen,
  fullscreen_mode: true,
  message: `
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 32px; box-sizing: border-box;">
        <h1>本実験に進む前に</h1><br>
        <p style="font-size: 20px">この度は、実験にご参加くださりありがとうございます。</p>
        <p style="font-size: 20px">本実験では、複数の音声を聴取し、それぞれの印象および想起する人物像を回答していただきます。</p>
        <p style="font-size: 20px">実験の所要時間は、説明、事後アンケートを含めて30分程度です。</p>
        <p style="font-size: 20px"><U><b>次の画面から全画面表示に切り替わります。</b></U></p>
        <p style="font-size: 20px; margin-bottom: 50px;">内容を確認できましたら、下の「次へ」をクリックしてください。</p>
      </div>`,
  button_label: "次へ",
};

// 全画面表示中に守ってほしい注意事項をまとめたページです。
const fullscreen_notice = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
      <div style="max-width: 1280px; margin: 0 auto; padding: 0 32px; box-sizing: border-box; text-align: left; color: #000;">
        <h1 style="font-size: 34px; text-align: center; margin: 22px 0 28px 0;">注意事項</h1>
        <p style="font-size: 20px; margin: 0 0 8px 0;">下記の注意事項をよく読んでください。</p>
        <p style="font-size: 20px; margin: 0 0 18px 0;">
          <U>注意事項を守らずに不具合が生じた場合、謝礼をお支払いできないことがありますので、ご注意ください。</U>
        </p>
        <ul style="font-size: 18px; line-height: 1.7; padding-left: 1.6em; margin: 0 0 36px 0;">
          <li style="margin-bottom: 18px;">
            <strong><U>全画面表示は絶対に解除しないでください。</U></strong>
            実験が終了すると自動的に解除されます。参加を途中で取りやめる場合のみ、ご自身で解除してください。
          </li>
          <li style="margin-bottom: 18px;">
            参加を取りやめたい場合は、<u><b>Escキーを押してブラウザを閉じてください。</b></u>
            <strong><U>ただし、実験の参加を途中で取りやめた場合、謝礼はお支払いできませんのでご注意ください。</U></strong>
          </li>
          <li style="margin-bottom: 18px;">
            <strong><U>課題中は、音楽やテレビ等は視聴しないでください。</U></strong>
            携帯電話・スマートフォンは電源を切るか、目につかない場所に保管してください。
          </li>
          <li style="margin-bottom: 18px;">
            <strong><U>課題中は、できる限り他の事をしないでください。</U></strong>
            お手洗い等は、課題が始まる前にお済ませください。やむを得ない事情により課題を中断した場合は、その旨を必ず事後アンケートにご記入ください。
          </li>
          <li style="margin-bottom: 0;">
            <strong><U>これから行う課題は、個人の認知能力や深層心理を調べるためのものではありません。</U></strong>
            あまり深く考えすぎずに、リラックスして取り組んでください。
          </li>
        </ul>
        <p style="font-size: 20px; font-weight: bold; margin: 0 0 50px 0;">
          注意事項を確認し、ご了承いただけた場合は、最後に「次へ」をクリックしてください。
        </p>
      </div>`,
  choices: ["次へ"],
};

// 練習試行に入る前に課題内容と流れを説明するページです。
const practice_intermission = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
      <div style="max-width: 1280px; margin: 0 auto; padding: 52px 32px 72px; box-sizing: border-box; text-align: left; color: #000;">
        <h1 style="font-size: 34px; text-align: center; margin: 0 0 48px 0;">印象評価課題について</h1>
        <p style="font-size: 20px; margin: 0 0 20px 0;">
          本実験では、音声の印象評価および人物像選択課題を行っていただきます。
        </p>
        <p style="font-size: 20px; margin: 0 0 20px 0;">
          <b><u>「イヤホン」または「ヘッドホン」を装着していることを、ここでもう一度ご確認ください。可能であれば「有線」のものをご使用ください。</u></b>
        </p>
        <p style="font-size: 20px; margin: 0 0 20px 0;">
          <b><u>また、パソコンのサウンド環境が「モノラル」ではなく「ステレオ」になっていることもご確認ください。</u></b>
        </p>
        ${voice_task_steps_html}
        <p style="font-size: 18px; margin: 0 0 8px 0;"><b>※なお、<u>音声は一度しか流れません</u>のでご注意ください</b></p>
        <p style="font-size: 18px; margin: 0 0 24px 0;">※あまり深く考えすぎず、感じたままに回答してください</p>
        <div style="margin: 0 auto 28px; text-align: center;">
          <img
            src="./assets/images/実験説明.png"
            alt="印象評価課題の流れ"
            style="width: min(100%, 920px); height: auto; display: inline-block;"
          >
        </div>
        <p style="font-size: 20px; margin: 0;">
          流れを理解していただくために、<u><b>一度練習していただきます</b></u>。準備ができたら「次へ」ボタンをクリックしてください。
        </p>
      </div>`,
  choices: ["次へ"],
  // このページだけ、次へボタンの下側に余白を追加します。
  on_load: () => {
    const buttonContainer = document.querySelector("#jspsych-html-button-response-btngroup");
    const button =
      document.querySelector("#jspsych-html-button-response-button-0 button") ||
      document.querySelector("#jspsych-html-button-response-button-0");

    if (!button) return;

    if (buttonContainer) {
      buttonContainer.style.marginTop = "0";
    }

    button.style.marginTop = "0";
    button.style.marginBottom = "48px";
  },
};

// 練習後に本試行前の確認をしてもらうページです。
const intermission = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
      <div style="max-width: 1280px; margin: 0 auto; padding: 52px 32px 72px; box-sizing: border-box; text-align: left; color: #000;">
        <h1 style="font-size: 34px; text-align: center; margin: 0 0 48px 0;">練習は以上になります</h1>
        <p style="font-size: 20px; margin: 0 0 18px 0;">
          音声が流れないとか、画面が固まってしまったなど問題はありませんでしたか？ もし、不具合がありましたら、お手数ですが、<u><b>Escキー</b></u>を押して同意取得からやり直してみてください。
        </p>
        <p style="font-size: 20px; margin: 0 0 18px 0;">
          <b><u>本番に進む前に、「イヤホン」または「ヘッドホン」を装着していることをもう一度ご確認ください。可能であれば「有線」のものをご使用ください。</u></b>
        </p>
        <p style="font-size: 20px; margin: 0 0 18px 0;">
          <b><u>また、パソコンのサウンド環境が「モノラル」ではなく「ステレオ」になっていることもご確認ください。</u></b>
        </p>
        <p style="font-size: 20px; margin: 0 0 20px 0;">
          下記の手順を今一度ご確認ください。
        </p>
        ${voice_task_steps_html}
        <p style="font-size: 17px; margin: 0 0 18px 0;"><b>※なお、<u>音声は一度しか流れません</u>のでご注意ください</b></p>
        <p style="font-size: 17px; margin: 0 0 18px 0;">
          ※もし、現段階や実験中に参加を取りやめます場合は、<u><b>Escキー</b></u>を押してブラウザを閉じてください。（謝礼はお支払いできませんのでご了承ください）
        </p>
        <p style="font-size: 20px; margin: 0;">
          それでは、準備が出来次第「次へ」ボタンを押して本番に進んでください。
        </p>
      </div>`,
  choices: ["次へ"],
  // このページでも、次へボタンの下側に余白を追加します。
  on_load: () => {
    const buttonContainer = document.querySelector("#jspsych-html-button-response-btngroup");
    const button =
      document.querySelector("#jspsych-html-button-response-button-0 button") ||
      document.querySelector("#jspsych-html-button-response-button-0");

    if (!button) return;

    if (buttonContainer) {
      buttonContainer.style.marginTop = "0";
    }

    button.style.marginTop = "0";
    button.style.marginBottom = "48px";
  },
};

// 実験本体の終了後に全画面表示を解除する処理です。
const exit_fullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: false,
  delay_after: 0,
};
