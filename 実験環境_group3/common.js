// 共通設定
const expname = "characteristic_voice"; // 実験名（ファイル名に使う）
const datapipe_experiment_id = "1Puj7qRrwxvd"; // DataPipeの実験ID（OSF保存用）

// 被験者ID（5桁ランダム）
var participant_ID = Math.floor(Math.random() * 90000) + 10000;

// jsPsych初期化（ここで1回だけ）
var jsPsych = initJsPsych();

// ファイル名生成
// クラウド(DataPipe)保存用のファイル名を生成
function createfilename(argseed) {
    // 日付時間秒を文字列で返す
    const dt = new Date();
    var yyyy = dt.getFullYear();
    var mm = ('00' + (dt.getMonth()+1)).slice(-2);
    var dd = ('00' + dt.getDate()).slice(-2);
    var hh = ('00' + dt.getHours()).slice(-2);
    var mi = ('00' + dt.getMinutes()).slice(-2);
    var se = ('00' + dt.getSeconds()).slice(-2);
    var answer = yyyy + mm + dd + "-" + hh + mi + se ;
    const subject_id = jsPsych.randomization.randomID(10);
    answer = argseed + answer + "-" + subject_id + ".csv" ;
    return(answer);
};
filename = createfilename(expname);

// イントロから問題までのインターバル
// 画面切り替え時に短い無表示インターバルを入れるための trial です。
const gap = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '',
    trial_duration: 300 // ← 500ミリ秒
};

// 保存
// DataPipe保存設定
// 実験全体のデータを DataPipe 経由で保存します。
const save_data = {
  type: jsPsychPipe,
  action: "save",
  experiment_id: datapipe_experiment_id, 
  filename: filename,
  data_string: ()=>jsPsych.data.get().csv()
};

// 実験終了の画面
// 保存後に確認コードを表示して終了案内を出す画面です。
const thanks = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: 
      '<div style="max-width: 900px; margin: 40px auto 0; text-align: center;">' +
      '<p style="font-size: 28px; margin: 0 0 6px 0;">この度は、調査へのご協力ありがとうございました。</p>' +
      '<p style="font-size: 28px; margin: 0 0 6px 0;">参加確認の際に、下記の確認コードが必要になります。</p>' +
      '<p style="font-size: 28px; margin: 0 0 44px 0;"><u><b>必ず控えを取っておいてください。</b></u></p>' +
      `<p style="font-size: 56px; font-weight: bold; margin: 0 0 56px 0;">${participant_ID}</p>` +
      '<p style="font-size: 22px; margin: 0;"><u>メモが取れましたら、ウィンドウを閉じて実験を終了してください。</u></p>' +
      '</div>',
    choices: "NO_KEYS"
};
