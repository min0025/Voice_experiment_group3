// =========================
// 本実験全体のフロー
// =========================
function main_experiment() {
  return [
    // 本試行前の概要説明です。
    experiment_notice,
    gap,
    // 全画面表示中の注意事項確認です。
    fullscreen_notice,
    gap,
    // 練習試行前の課題説明です。
    practice_intermission,
    gap,
    // 練習用2試行です。
     ...practice_trials,
    gap,
    // 練習後に本試行前の再確認を行います。
    intermission,
    gap,
    // 本試行25音声分です。
     ...trials_combined,
    gap,
    // 実験後の属性回答です。
    demographics,
    gap,
    // 実験後アンケートです。
    post_experiment_survey,
    gap,
    // 確認コード表示前に全画面を解除します。
    exit_fullscreen,
  ];
}
