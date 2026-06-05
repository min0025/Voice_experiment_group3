// スクリーニング用刺激
const scr_stimuli = [
  {name: "quiet", file: "./assets/screening/tone_quiet.wav"},
  {name: "normal", file: "./assets/screening/tone_normal.wav"},
  {name: "anti", file: "./assets/screening/tone_antiphase.wav"}
];

// 参加者が本試行前に音量を合わせるための画面です。
const volume_adjustment = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <h1>音量の調節</h1><br>
    <p style="font-size: 20px">ここでは、ご自身で音量調節を行ってもらいます。再生ボタンを押すと音声が流れます。</p>
    <p style="font-size: 20px"><U><b>「イヤホン」または「ヘッドホン」は装着したままで音声を聞き、ちょうどよいと思う音量に調節してください。</b></U></p>
    <p style="font-size: 20px; margin-bottom: 35px"><u>音声は何回でも再生可能です</u>。</p>
    <div style="text-align: center; margin-bottom: 30px;">
      <button type="button" id="volumePlayBtn">再生</button>
      <audio id="volumeAudio" src="./assets/practice/VOICEACTRESS100_026_006.wav"></audio>
    </div>
    <p style="font-size: 18px;">音量調節が終わったら「次へ」を押してください。</p>
  `,
  choices: ["次へ"],
  // 再生後だけ次へ進めるようにボタン状態を制御します。
  on_load: function(){
    const playBtn = document.getElementById("volumePlayBtn");
    const audio = document.getElementById("volumeAudio");
    const nextBtn =
      document.querySelector("#jspsych-html-button-response-button-0 button") ||
      document.querySelector("#jspsych-html-button-response-button-0");

    if (!playBtn || !audio || !nextBtn) return;

    nextBtn.disabled = true;

    playBtn.addEventListener("click", function(){
      nextBtn.disabled = true;
      playBtn.disabled = true;
      audio.currentTime = 0;
      audio.play();
    });

    audio.addEventListener("play", function(){
      playBtn.textContent = "再生中...";
    });

    audio.addEventListener("ended", function(){
      nextBtn.disabled = false;
      playBtn.disabled = false;
      playBtn.textContent = "もう一度再生";
    });

    audio.addEventListener("pause", function(){
      if (!audio.ended) {
        playBtn.disabled = false;
        playBtn.textContent = "再生";
      }
    });
  }
};

// 1回分のスクリーニング本体
// ヘッドホン装着を確認する6問のスクリーニング本体です。
const screening_trial = {
  type: jsPsychHtmlButtonResponse,
  
  // 画面表示内容
  stimulus: `
    <h1>実験前の確認</h1><br>
    <p style="font-size: 20px"><B><U>必ず「ヘッドホン」か「イヤホン」を装着してください</U></B></p>
    <p style="font-size: 20px">再生ボタンを押すと、3つの音が順番に再生されます</p>
    <p style="font-size: 20px">3つの音の中で<b><u>最も小さく聞こえた音</u></b>について、<U><b>その音が何番目に流れたか</b></U>を選択してください</p>
    <p style="font-size: 20px; margin-bottom: 40px">この試行は6回行われます。</p>
    <hr>
    <div id="controls"></div>
    <br>
    <button id="nextBtn" disabled>次へ</button>
  `,

  choices: [],
  // 音声の連続再生と回答UIの切り替えをまとめて管理します。
  on_load: function(){

    let current = 0; // 現在の試行番号
    let answers = []; // 回答記録
    let corrects = []; // 正解記録

    const container = document.getElementById("controls"); // 何回目の音声再生か
    const nextBtn = document.getElementById("nextBtn"); // 次へボタンの要素

    // 音を順番に再生
    // 3つの音を指定順で連続再生します。
    function playSequence(order, callback){
      let i = 0;

      // 現在位置の音を1つ再生して次の音へ進めます。
      function playNext(){
        if(i >= order.length){
          callback();
          return;
        }

        const audio = new Audio(order[i].file);
        audio.preload = "auto";

        audio.play().catch((error) => {
          console.error("Screening audio playback failed:", order[i].file, error);
          alert("音声の再生に失敗しました。通信状況やファイル配置を確認して、もう一度お試しください。");
          playBtn.disabled = false;
          playBtn.textContent = "再生";
        });

        // 再生終了後に次へ
        audio.onended = function(){
          setTimeout(() => {
            i++;
            playNext();
          }, 500);
        };
      }

      playNext(); // 次の再生へ
    }

    // UIの描画
    // 各試行の画面を描画して正解位置も記録します。
    function render(){
      // 毎回シャッフルして順番を変える
      let order = jsPsych.randomization.shuffle([...scr_stimuli]);
      // 正解（quietの位置）を記録
      const correct = order.findIndex(s => s.name === "quiet") + 1;
      corrects[current] = correct;

      // HTML描画
      container.innerHTML = `
        <p style="font-size: 24px; margin-top: 30px;">${current+1} / 6 試行目</p>

        <div style="margin-top:40px; margin-bottom:20px;">
          <label><input type="radio" name="ans" value="1" disabled>1番目</label>
          <label><input type="radio" name="ans" value="2" disabled>2番目</label>
          <label><input type="radio" name="ans" value="3" disabled>3番目</label>
        </div>

        <br>
        <button id="playBtn">再生</button>
        <button id="decideBtn" disabled>決定</button>
      `;

      const playBtn = document.getElementById("playBtn"); // 音声再生ボタンの状態取得
      const decideBtn = document.getElementById("decideBtn"); // 決定ボタンの状態取得
      const radios = document.querySelectorAll('input[name="ans"]'); // ラジオボタンの状態取得

      let selected = null;

      // =========================
      // 再生ボタン
      // =========================
      playBtn.onclick = function(){
        // 再生中は操作不可
        playBtn.disabled = true;
        playBtn.textContent = "再生中...";
        decideBtn.disabled = true;
        radios.forEach(r => r.disabled = true);

        playSequence(order, function(){
          // 再生後
          playBtn.textContent = "再生済み";
          radios.forEach(r => r.disabled = false);
        });
      };

      // =========================
      // ラジオ選択
      // =========================
      radios.forEach(r => {
        r.onchange = function(){
          selected = parseInt(r.value); // 選択された値を記録
          decideBtn.disabled = false; // 決定ボタンを有効化
        };
      });

      // =========================
      // 決定ボタン
      // =========================
      decideBtn.onclick = function(){

      if(selected == null) return;

      answers[current] = selected;

      // =========================
      // 最終試行かどうか
      // =========================
      if(current < 5){

        current++;
        render();

      } else {

        decideBtn.disabled = true; // 決定ボタンを操作不可に
        playBtn.disabled = true; // 再生ボタンを操作不可に
        radios.forEach(r => r.disabled = true); // ラジオボタンを操作不可に
        nextBtn.disabled = false; // 次へボタンを有効化
      }
    };
  }

    render();

    // =========================
    // 試行正解数の計算結果
    // =========================
    nextBtn.onclick = function(){

      let correct_count = 0;

      for(let i=0; i<6; i++){
        if(answers[i] === corrects[i]){
          correct_count++;
        }
      }

      const pass = correct_count >= 5;

      jsPsych.finishTrial({
        correct_count: correct_count,
        pass: pass,
        screening_score: correct_count,
        screening_pass: pass
      });
    };
  }
};

// スクリーニング失敗時の再確認画面
// スクリーニング失敗時に装着状況を確認してもらう画面です。
const screening_retry_notice = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <h1>装着状況の再確認</h1><br>
    <p style="font-size: 20px"><b><u>「イヤホン」または「ヘッドホン」を装着した上で聴取してますか？</u></b></p>
    <p style="font-size: 20px">必ず装着した上で参加してください。</p>
    <p style="font-size: 20px">最初からやり直します。</p>
  `,
  choices: ["最初から"]
};

// 直前の結果が不合格だった場合だけ再確認画面を表示します。
const screening_retry_block = {
  timeline: [screening_retry_notice],
  conditional_function: function(){
    const last_trial = jsPsych.data.get().last(1).values()[0];
    return last_trial && last_trial.pass === false;
  }
};

// スクリーニング全体構成
// 合格するまでスクリーニング本体を繰り返す全体ブロックです。
const screening = {
  timeline: [screening_trial, screening_retry_block],
  loop_function: function(data){
    const screening_data = data.values().find(trial => Object.prototype.hasOwnProperty.call(trial, "pass"));
    return screening_data && screening_data.pass === false;
  }
};
