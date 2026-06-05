// =========================
// 属性回答
// =========================
// 実験終了後に参加者属性を回収するフォームです。
const demographics = {
  type: jsPsychSurveyHtmlForm,
  preamble:
    "<h1>お疲れ様でした</h1><p style='font-size: 20px'>ご自身の以下項目にご回答をお願いします</p>",
  html: `
      <ul style="font-size: 20px; line-height: 1.9; text-align: left; display: inline-block; padding-left: 1.4em; margin: 0 0 12px 0;">
        <li style="margin-bottom: 10px;">
          <span>性別：</span>
          <label><input name="gender" type="radio" value="male" required> 男性</label>
          <label><input name="gender" type="radio" value="female"> 女性</label>
          <label><input name="gender" type="radio" value="other"> その他</label>
          <label><input name="gender" type="radio" value="noans"> 答えたくない</label>
        </li>
        <li>
          <label for="age-input" style="margin-right: 4px;">年齢：</label><input
            name="age"
            id="age-input"
            type="number"
            min="0"
            max="120"
            inputmode="numeric"
            required
            style="width: 120px; padding: 4px 8px; font-size: 18px; box-sizing: border-box;"
          >
          <span>（入力例：32）</span>
        </li>
      </ul>
    `,
  button_label: "次へ",
  // 性別と年齢の両方が入力されたときだけ次へ進めるようにします。
  on_load: () => {
    setTimeout(() => {
      const form = document.querySelector("#jspsych-survey-html-form");
      const button = document.querySelector("#jspsych-survey-html-form-next");
      const genderInputs = form.querySelectorAll('input[name="gender"]');
      const ageInput = form.querySelector("#age-input");

      if (!button || !ageInput || genderInputs.length === 0) return;

      button.disabled = true;

      const update = () => {
        const genderChecked = Array.from(genderInputs).some((r) => r.checked);
        const ageValue = ageInput.value.trim();
        const ageValid =
          ageValue !== "" &&
          !isNaN(ageValue) &&
          ageValue >= 0 &&
          ageValue <= 120;
        button.disabled = !(genderChecked && ageValid);
      };

      genderInputs.forEach((r) => r.addEventListener("change", update));
      ageInput.addEventListener("input", update);
      update();
    }, 0);
  },
};

// =========================
// 実験後アンケート
// =========================
// 実験後の不具合や参加状況をまとめて確認するアンケートです。
const post_experiment_survey = {
  type: jsPsychSurveyHtmlForm,
  preamble:
    "<h1 style='margin-top: 64px;'>最後にアンケートの回答をお願いします</h1>" +
    "<p style='font-size: 20px'><u>以下の項目にご回答ください。<u><b>回答が謝礼に影響することはないので、正直にお答えください。</b></u></p>",
  html: `
      <div style="text-align: left; max-width: 980px; margin: 0 auto; padding-top: 12px; font-size: 18px; line-height: 1.8;">
        <p><b>1. 課題はスムーズに動きましたか？</b></p>
        <label><input name="task_smoothness" type="radio" value="smooth" required> スムーズに動いた</label><br>
        <label><input name="task_smoothness" type="radio" value="minor_issue"> やや問題があった</label><br>
        <label><input name="task_smoothness" type="radio" value="major_issue"> 重大な問題があった</label>

        <p style="margin-top: 28px;"><b>2. 問題があったと回答された方は、どのような問題があったか、当てはまる項目を選んでください（問題なかった場合は「すべて問題なく動作した」を選択してください）</b></p>
        <label><input name="issue_type" type="radio" value="reload_needed" required> 文章や画像がロードされずリロードしなければならなかった</label><br>
        <label><input name="issue_type" type="radio" value="nothing_displayed"> 何も表示されないことがあった</label><br>
        <label><input name="issue_type" type="radio" value="connection_issue"> 実験中、インターネット接続が途切れたり、回線速度が遅くなったりした</label><br>
        <label><input name="issue_type" type="radio" value="no_issue"> すべて問題なく動作した</label>

        <p style="margin-top: 28px;"><b>3. この実験に参加するのは初めてですか？</b></p>
        <label><input name="first_time_participant" type="radio" value="yes" required> はい</label><br>
        <label><input name="first_time_participant" type="radio" value="no"> いいえ</label>

        <p style="margin-top: 28px;"><b>4. 実験の最中、何か課題とは関係のないこと（音楽を聴く、テレビを見るなど）をしましたか？</b></p>
        <label><input name="unrelated_activity" type="radio" value="yes" required> はい</label><br>
        <label><input name="unrelated_activity" type="radio" value="no"> いいえ</label>

        <p style="margin-top: 28px;"><b>5. 何らかの事情で実験を中断しましたか？</b></p>
        <label><input name="interrupted" type="radio" value="yes" required> はい</label><br>
        <label><input name="interrupted" type="radio" value="no"> いいえ</label>

        <p style="margin-top: 28px;"><b>6. よろしければ、実験中の不具合や他に気づいたことがあれば、こちらにご記入ください（任意回答）</b></p>
        <textarea
          name="free_comment"
          rows="6"
          style="width: 100%; max-width: 100%; font-size: 16px; padding: 10px; box-sizing: border-box;"
        ></textarea>
      </div>
    `,
  button_label: "次へ",
  // 必須のラジオボタン項目が埋まるまで次へを無効にします。
  on_load: () => {
    setTimeout(() => {
      const form = document.querySelector("#jspsych-survey-html-form");
      const button = document.querySelector("#jspsych-survey-html-form-next");

      if (!form || !button) return;

      const requiredGroups = [
        "task_smoothness",
        "issue_type",
        "first_time_participant",
        "unrelated_activity",
        "interrupted",
      ];

      button.disabled = true;

      const update = () => {
        const allAnswered = requiredGroups.every((name) =>
          !!form.querySelector(`input[name="${name}"]:checked`)
        );
        button.disabled = !allAnswered;
      };

      form.addEventListener("change", update);
      update();
    }, 0);
  },
};
