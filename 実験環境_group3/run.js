// タイムライン生成
const timeline = [];

timeline.push(consent_form, gap); // 同意書を入れる

// クラウドワークス作業者ID
timeline.push(worker_id_form, gap);

// スクリーニング
timeline.push(screening, gap);

// 音量調整
timeline.push(volume_adjustment, gap);

// スクリーニングの結果データを付与
timeline.push({
  type: jsPsychCallFunction,
  func: function(){
    const data = jsPsych.data.get().filterCustom(function(trial){
      return Object.prototype.hasOwnProperty.call(trial, "screening_pass");
    }).last(1).values()[0];

    jsPsych.data.addProperties({
      screening_pass: data.screening_pass,
      screening_score: data.screening_score
    });
  }
}); 

// 本実験へ進む
timeline.push(gap, ...main_experiment());

// 本実験結果を保存し終了
timeline.push(save_data, thanks);

jsPsych.run(timeline); // タイムラインを実行する
