// =========================
// 話者性別のメタデータ
// =========================
const speaker_gender_map = [
  "M", "F", "M", "F", "M", "M", "F", "F", "M", "F",
  "M", "M", "M", "F", "F", "F", "F", "F", "F", "M",
  "M", "M", "M", "F", "F", "F", "F", "M", "F", "F",
  "M", "M", "M", "M", "F", "F", "M", "F", "F", "F",
  "M", "M", "F", "M", "M", "M", "M", "M", "M", "M",
  "F", "M", "F", "M", "F", "F", "F", "F", "F", "F",
  "F", "F", "F", "F", "F", "F", "F", "M", "F", "M",
  "M", "F", "M", "M", "M", "M", "M", "M", "M", "M",
  "M", "F", "F", "F", "F", "M", "M", "M", "M", "F",
  "F", "F", "F", "F", "F", "F", "M", "M", "M", "M",
];

// =========================
// 本試行・練習試行の刺激一覧
// =========================
// 本試行76〜100番音声にファイルパスと話者メタデータを付与します。
const all_stimuli = Array.from({ length: 25 }, (_, i) => {
  const speakerNumber = i + 1;
  const num = String(speakerNumber).padStart(3, "0");
  return {
    id: speakerNumber - 1,
    stim_num: num,
    speaker_id: `jvs${num}`,
    speaker_gender: speaker_gender_map[speakerNumber - 1],
    file: `./assets/main/VOICEACTRESS100_026_${num}.wav`,
  };
});

// 今回の本試行では定義済みの76〜100番音声を提示します。
const assigned_stimuli = jsPsych.randomization.shuffle(all_stimuli);

// 練習用に使う2音声のメタデータです。
const practice_stimuli = [
  {
    id: "practice_1",
    stim_num: null,
    speaker_id: "practice_1",
    speaker_gender: null,
    file: "./assets/practice/VOICEACTRESS100_026_053.wav",
  },
  {
    id: "practice_2",
    stim_num: null,
    speaker_id: "practice_2",
    speaker_gender: null,
    file: "./assets/practice/VOICEACTRESS100_026_080.wav",
  },
];

// =========================
// 評価項目
// =========================
const adjectives = [
  { left: "男性的", right: "女性的" },
  { left: "幼い感じ", right: "老けた感じ" },
  { left: "親切な", right: "意地悪な" },
  { left: "暖かい", right: "冷たい" },
  { left: "強そうな", right: "弱そうな" },
  { left: "偉そうな", right: "控えめな" },
];

const likert_bio = [
  "成人男性",
  "少年",
  "おじいさん",
  "上司",
  "成人女性",
  "少女",
  "おばあさん",
  "お嬢様",
  "奥様",
  "幼児",
];

const likert_scale = [
  "<span style='font-size: 17px;'><p>とても<br>当てはまる</br></p></span>",
  "<span style='font-size: 17px;'><p>当てはまる</p></span>",
  "<span style='font-size: 17px;'><p>少し<br>当てはまる</br></p></span>",
  "<span style='font-size: 17px;'><p>どちらとも<br>いえない</br></p></span>",
  "<span style='font-size: 17px;'><p>少し<br>当てはまる</br></p></span>",
  "<span style='font-size: 17px;'><p>当てはまる</p></span>",
  "<span style='font-size: 17px;'><p>とても<br>当てはまる</br></p></span>",
];

// 音声ファイルのプリロード結果をキャッシュします。
const preloaded_audio_map = new Map();

// 再生前に音声を取得して、再生開始時のラグを減らします。
async function preloadAudioFile(file) {
  if (preloaded_audio_map.has(file)) {
    return preloaded_audio_map.get(file);
  }

  const preloadPromise = fetch(file, { cache: "force-cache" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to preload ${file}: ${response.status}`);
      }
      return response.blob();
    })
    .then((blob) => URL.createObjectURL(blob));

  preloaded_audio_map.set(file, preloadPromise);
  return preloadPromise;
}

// =========================
// 各音声に対する評価画面の生成
// =========================
// 音声再生から印象評価・人物像回答までの1試行群を生成します。
function createVoiceTrials(stimuli, options = {}) {
  // 表示ラベルと保存用のブロック名を呼び出し側から受け取ります。
  const { phaseLabel, blockName, questionText } = options;

  return stimuli.map((stim, index) => {
    const shuffled_adjectives = jsPsych.randomization.shuffle([...adjectives]);

    return {
      type: jsPsychSurveyHtmlForm,
      required: true,
      button_label: "次へ",
      html: `
  <div class="stimulus-box">
    <p style="font-size: 30px;"><b>${phaseLabel}${index + 1} / ${stimuli.length} 音声目</b></p>
  </div>

  <p style="font-size: 19px; margin-top: 10px;">
      <b>${questionText}</b>
  </p>

  <p style="font-size: 19px; margin-bottom: 40px;">
      <b>※音声は一度しか流れません</b>
  </p>

  <div style="text-align: center; margin-bottom: 30px;">
    <button type="button" id="playBtn">再生</button>
    <audio id="audioElem" src="${stim.file}"></audio>
  </div>
  <hr>

  <div id="question-area" style="visibility: hidden; pointer-events: none;">
    <p style="font-size: 19px; margin-top: 50px;">
      <b>Q1. 流れた音声の印象について、下記の項目に最もよく当てはまるものを答えてください</b>
    </p>

    <div id="sd-container"></div>
    <hr>

    <p style="margin-top: 45px;">
      <b style="font-size: 19px;">Q1. 流れた音声から<U>最も</U>当てはまる「人物像」を<U>1つ選んでください</U></b>
    </p>
    <div class="bio-group">
      ${likert_bio.map(opt => `
        <label class="bio-option">
          <input type="radio" name="bio1" value="${opt}" disabled>
          <span>${opt}</span>
        </label>
      `).join("")}
    </div>

    <p style="margin-top: 100px;">
      <b style="font-size: 19px; margin-top: 100px;">Q2. 流れた音声から当てはまる「人物像」を<U><b>1問目の回答も含めて</b>全て選んでください</U><br>(
      1問目で回答した選択肢しか当てはまらない場合は、1問目と同じように回答してください）</b>
    </p>
    <div class="bio-group">
      ${likert_bio.map(opt => `
        <label class="bio-option">
          <input type="checkbox" name="bio2_${opt}" value="${opt}" disabled>
          <span>${opt}</span>
        </label>
      `).join("")}
    </div>
  </div>
`,
      data: {
        stim_id: stim.id,
        stim_num: stim.stim_num ?? null,
        speaker_id: stim.speaker_id ?? null,
        speaker_gender: stim.speaker_gender ?? null,
        group: blockName === "practice_voice" ? "practice" : 0,
        block: blockName,
      },
      // 音声再生後にだけ回答欄を開放するUI制御を行います。
      on_load: () => {
        const form = document.querySelector("#jspsych-survey-html-form");
        const questionArea = document.getElementById("question-area");
        const audio = document.getElementById("audioElem");
        const playBtn = document.getElementById("playBtn");
        const submitBtn = document.querySelector("#jspsych-survey-html-form-next");
        const nextStim = stimuli[index + 1];

        let audioFinished = false;
        let html = "";

        shuffled_adjectives.forEach((pair, i) => {
          html += `<div class="sd-row">`;
          html += `
      <div class="sd-label left">
        <span style='font-size: 24px;'>${pair.left}</span>
      </div>
    `;
          html += `<div class="sd-scale">`;
          likert_scale.forEach((label, j) => {
            html += `
        <div class="sd-option">
          <input type="radio" name="sd_${i}" value="${j}">
          <div class="sd-text">${label}</div>
        </div>
      `;
          });
          html += `</div>`;
          html += `
      <div class="sd-label right">
        <span style='font-size: 24px;'>${pair.right}</span>
      </div>
    `;
          html += `</div>`;
        });

        document.getElementById("sd-container").innerHTML = html;

        // SD法6項目がすべて回答済みかを判定します。
        const sdOk = () =>
          adjectives.every((_, i) =>
            !!form.querySelector(`input[name="sd_${i}"]:checked`)
          );

        // 単一選択の人物像が選ばれているかを判定します。
        const bio1Ok = () => !!form.querySelector('input[name="bio1"]:checked');
        // 複数選択の人物像が1つ以上選ばれているかを判定します。
        const bio2Ok = () =>
          form.querySelectorAll('input[name^="bio2_"]:checked').length > 0;
        const allOk = () => audioFinished && sdOk() && bio1Ok() && bio2Ok();

        // 音声再生状況に応じて入力欄と次へボタンの状態を更新します。
        const updateState = () => {
          form.querySelectorAll('input[name^="sd_"], input[name="bio1"]').forEach(el => {
            el.disabled = !audioFinished;
          });

          const enableBio2 = audioFinished && bio1Ok();
          form.querySelectorAll('input[name^="bio2_"]').forEach(el => {
            el.disabled = !enableBio2;
          });

          submitBtn.disabled = !allOk();
        };

        submitBtn.disabled = true;
        form.querySelectorAll("input").forEach(el => el.disabled = true);
        playBtn.disabled = true;
        playBtn.textContent = "読み込み中...";

        preloadAudioFile(stim.file)
          .then((loadedFile) => {
            audio.src = loadedFile;
            audio.load();
            playBtn.disabled = false;
            playBtn.textContent = "再生";
          })
          .catch((error) => {
            console.error("Voice trial preload failed:", stim.file, error);
            playBtn.textContent = "再生";
            playBtn.disabled = false;
          });

        if (nextStim) {
          preloadAudioFile(nextStim.file).catch((error) => {
            console.error("Next voice trial preload failed:", nextStim.file, error);
          });
        }

        playBtn.addEventListener("click", () => {
          playBtn.disabled = true;
          playBtn.textContent = "再生中...";
          audio.currentTime = 0;
          audio.play().catch((error) => {
            console.error("Voice trial playback failed:", stim.file, error);
            playBtn.disabled = false;
            playBtn.textContent = "再生";
            alert("音声の再生に失敗しました。通信状況を確認して、もう一度お試しください。");
          });
        });

        audio.addEventListener("ended", () => {
          playBtn.textContent = "再生済み";
          questionArea.style.visibility = "visible";
          questionArea.style.pointerEvents = "auto";
          audioFinished = true;
          updateState();
        });

        form.addEventListener("change", () => {
          updateState();
        });

        form.addEventListener("submit", (e) => {
          updateState();
          if (!allOk()) {
            e.preventDefault();
            alert("未回答があります。SD法6項目・単一選択1問・複数選択1問のすべてに回答してください。");
          }
        });

        setTimeout(() => {
          if (form && submitBtn) {
            form.appendChild(submitBtn);
            submitBtn.style.display = "block";
            submitBtn.style.margin = "120px auto";
          }
        }, 0);
      },
      // 回答結果を列ごとに整形して保存データへ追加します。
      on_finish: function (data) {
        const res = data.response || {};

        shuffled_adjectives.forEach((pair, i) => {
          const val = res[`sd_${i}`];
          data[`sd_${pair.left}_${pair.right}`] =
            val !== undefined && val !== "" ? Number(val) : null;
        });

        data.bio1 = res.bio1 ?? null;
        data.bio2 = Object.keys(res)
          .filter(key => key.startsWith("bio2_"))
          .map(key => res[key])
          .join("|");
      },
    };
  });
}

// =========================
// 練習試行・本試行の生成
// =========================
// 練習用2試行を実際の trial 配列へ変換します。
const practice_trials = createVoiceTrials(
  jsPsych.randomization.shuffle([...practice_stimuli]),
  {
    phaseLabel: "練習 ",
    blockName: "practice_voice",
    questionText: "これは練習試行です。再生ボタンで音声を聞き、Q1 ~ Q3までの各問に回答してください",
  }
);

// 割り当てられた25音声を本試行の trial 配列へ変換します。
const trials_combined = createVoiceTrials(assigned_stimuli, {
  phaseLabel: "",
  blockName: "voice_main",
  questionText: "再生ボタンで音声を聞き、Q1 ~ Q3までの各問に回答してください",
});
