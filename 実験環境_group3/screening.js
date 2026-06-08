// スクリーニング用刺激
// 3音を1ファイルに連結した6通りの順列音声と、quiet の正解位置を対応づけます。
const scr_stimuli = [
  { order: ["quiet", "normal", "anti"], quiet_position: 1, file: new URL("./assets/screening/screening_quiet_normal_anti.wav", window.location.href).href },
  { order: ["quiet", "anti", "normal"], quiet_position: 1, file: new URL("./assets/screening/screening_quiet_anti_normal.wav", window.location.href).href },
  { order: ["normal", "quiet", "anti"], quiet_position: 2, file: new URL("./assets/screening/screening_normal_quiet_anti.wav", window.location.href).href },
  { order: ["normal", "anti", "quiet"], quiet_position: 3, file: new URL("./assets/screening/screening_normal_anti_quiet.wav", window.location.href).href },
  { order: ["anti", "quiet", "normal"], quiet_position: 2, file: new URL("./assets/screening/screening_anti_quiet_normal.wav", window.location.href).href },
  { order: ["anti", "normal", "quiet"], quiet_position: 3, file: new URL("./assets/screening/screening_anti_normal_quiet.wav", window.location.href).href },
];

// スクリーニング連結音声のプリロード結果を保持します。
let preloaded_scr_stimuli = null;

// 参加者が本試行前に音量を合わせるための画面です。
const volume_adjustment = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <h1>音量の調節</h1><br>
    <p style="font-size: 20px">ここでは、ご自身で音量調節を行ってもらいます。再生ボタンを押すと音声が流れます。</p>
    <p style="font-size: 20px"><U><b>「イヤホン」または「ヘッドホン」は装着したままで音声を聞き、可能であれば「有線」のものをご使用ください。</b></U></p>
    <p style="font-size: 20px"><U><b>また、パソコンのサウンド環境は「モノラル」ではなく「ステレオ」に設定してください。</b></U></p>
    <p style="font-size: 20px; margin-bottom: 35px"><u>音声は何回でも再生可能です</u>。</p>
    <div style="text-align: center; margin-bottom: 30px;">
      <button type="button" id="volumePlayBtn">再生</button>
      <audio id="volumeAudio" src="./assets/practice/VOICEACTRESS100_026_054.wav"></audio>
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
    const volumeAudioFile = new URL(
      "./assets/practice/VOICEACTRESS100_026_054.wav",
      window.location.href
    ).href;

    if (!playBtn || !audio || !nextBtn) return;

    nextBtn.disabled = true;
    playBtn.disabled = true;
    playBtn.textContent = "読み込み中...";

    fetch(volumeAudioFile, { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to preload ${volumeAudioFile}: ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        audio.src = URL.createObjectURL(blob);
        audio.load();
        playBtn.disabled = false;
        playBtn.textContent = "再生";
      })
      .catch((error) => {
        console.error("Volume adjustment preload failed:", volumeAudioFile, error);
        playBtn.disabled = false;
        playBtn.textContent = "再生";
      });

    playBtn.addEventListener("click", function(){
      nextBtn.disabled = true;
      playBtn.disabled = true;
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.error("Volume adjustment playback failed:", volumeAudioFile, error);
        playBtn.disabled = false;
        playBtn.textContent = "再生";
      });
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
    <p style="font-size: 20px"><B><U>必ず「ヘッドホン」または「イヤホン」を装着し、可能であれば「有線」のものをご使用ください</U></B></p>
    <p style="font-size: 20px"><B><U>また、パソコンのサウンド環境は「モノラル」ではなく「ステレオ」に設定してください</U></B></p>
    <p style="font-size: 20px">再生ボタンを押すと、3つの音が順番に再生されます</p>
    <p style="font-size: 20px">3つの音の中で<b><u>最も小さく聞こえた音</u></b>について、<U><b>その音が何番目に流れたか</b></U>を選択してください</p>
    <p style="font-size: 20px; margin-bottom: 40px">この試行は6回行われます。</p>
    <hr>
    <div id="controls"></div>
    <audio id="screeningAudio" preload="auto"></audio>
    <br>
    <button id="nextBtn" disabled>次へ</button>
  `,

  choices: [],
  // 音声の連続再生と回答UIの切り替えをまとめて管理します。
  on_load: function(){

    let current = 0; // 現在の試行番号
    let answers = []; // 回答記録
    let corrects = []; // 正解記録
    const sequence_order = jsPsych.randomization.shuffle([...scr_stimuli]); // 6通りの順列を1回ずつ使う順番

    const container = document.getElementById("controls"); // 何回目の音声再生か
    const screeningAudio = document.getElementById("screeningAudio"); // スクリーニング再生に使うaudio要素
    const nextBtn = document.getElementById("nextBtn"); // 次へボタンの要素

    // 連結済みスクリーニング音声を先に取得して再生ラグを減らします。
    async function preloadScreeningFiles(){
      if (preloaded_scr_stimuli) {
        return preloaded_scr_stimuli;
      }

      preloaded_scr_stimuli = await Promise.all(
        scr_stimuli.map(async (stim) => {
          const response = await fetch(stim.file, { cache: "force-cache" });
          if (!response.ok) {
            throw new Error(`Failed to preload ${stim.file}: ${response.status}`);
          }

          const blob = await response.blob();
          return {
            ...stim,
            loaded_file: URL.createObjectURL(blob),
          };
        })
      );

      return preloaded_scr_stimuli;
    }

    // 単一の連結音声ファイルを1回再生します。
    function playScreeningFile(file){
      return new Promise((resolve, reject) => {
        const cleanup = () => {
          screeningAudio.removeEventListener("ended", handleEnded);
          screeningAudio.removeEventListener("error", handleError);
        };

        const handleEnded = () => {
          cleanup();
          resolve();
        };

        const handleError = () => {
          cleanup();
          reject(new Error(`Failed to play ${file}`));
        };

        screeningAudio.pause();
        screeningAudio.currentTime = 0;
        screeningAudio.src = file;
        screeningAudio.load();
        screeningAudio.addEventListener("ended", handleEnded);
        screeningAudio.addEventListener("error", handleError);

        screeningAudio.play().catch((error) => {
          cleanup();
          reject(error);
        });
      });
    }

    // UIの描画
    // 各試行の画面を描画して正解位置も記録します。
    function render(){
      // 連結済み6パターンを1試行につき1回ずつ使います。
      const sequence = sequence_order[current];
      // quiet の正解位置を記録します。
      corrects[current] = sequence.quiet_position;

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

        playScreeningFile(sequence.loaded_file || sequence.file)
          .then(() => {
            playBtn.textContent = "再生済み";
            radios.forEach(r => r.disabled = false);
          })
          .catch((error) => {
            console.error("Screening audio playback failed:", sequence.file, error);
            alert("音声の再生に失敗しました。通信状況やファイル配置を確認して、もう一度お試しください。");
            playBtn.disabled = false;
            playBtn.textContent = "再生";
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
    container.innerHTML = `<p style="font-size: 20px; margin-top: 30px;">音声を読み込んでいます。しばらくお待ちください。</p>`;

    preloadScreeningFiles()
      .then((loadedStimuli) => {
        for (let i = 0; i < sequence_order.length; i++) {
          const matched = loadedStimuli.find(
            (stim) => stim.file === sequence_order[i].file
          );
          if (matched) {
            sequence_order[i] = matched;
          }
        }

        render();
      })
      .catch((error) => {
        console.error("Screening preload failed:", error);
        container.innerHTML =
          `<p style="font-size: 20px; margin-top: 30px;">音声の読み込みに失敗しました。ページを再読み込みして、もう一度お試しください。</p>`;
      });

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
    <p style="font-size: 20px"><b><u>「イヤホン」または「ヘッドホン」を装着した上で聴取していますか？ 可能であれば「有線」のものをご使用ください。</u></b></p>
    <p style="font-size: 20px"><b><u>パソコンのサウンド環境が「モノラル」ではなく「ステレオ」になっていることもご確認ください。</u></b></p>
    <p style="font-size: 20px">必ず設定を確認した上で参加してください。</p>
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
