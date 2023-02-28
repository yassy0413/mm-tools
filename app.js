"use strict";
$(document).ready( function(){

  $('select').formSelect();

  const mt = new MersenneTwister(Date.now());
  const gen_method = $('#gen-method');
  const gen_method_rate = $('#gen-method-rate');
  const gen_intencity = $('#gen-intencity');
  const gen_times = $('#gen-times');
  const your_speed = $('#your_speed');
  const your_speed_min = $('#your_speed_min');
  const your_speed_max = $('#your_speed_max');
  const enemy_speed = $('#enemy_speed');
  const enemy_speed_min = $('#enemy_speed_min');
  const enemy_speed_max = $('#enemy_speed_max');
  const your_win_rate = $('#your_win_rate');
  const enemy_win_rate = $('#enemy_win_rate');
  const perform = $('#perform');

  const UpdateMinMax = (spd, min, max) => {
    let value = Number(spd.val());
    let intencity = Number(gen_intencity.val()) / 100.0;
    let method = Number(gen_method.val());
    if (method == 1){
      min.text(Math.floor(value - value * intencity));
      max.text(Math.floor(value));
    }else{
      min.text(Math.floor(value - value * intencity));
      max.text(Math.floor(value + value * intencity));
    }
  };
  const UpdateMinMaxBoth = () => {
    UpdateMinMax(your_speed, your_speed_min, your_speed_max);
    UpdateMinMax(enemy_speed, enemy_speed_min, enemy_speed_max);
  };
  const UpdateGenMethodRate = () => {
    let method = Number(gen_method.val());
    if (method == 1){
      let intencity = Number(gen_intencity.val());
      gen_method_rate.text((100 - intencity) + "% 〜 100%");
    }else{
      let intencity = Number(gen_intencity.val());
      gen_method_rate.text((100 - intencity) + "% 〜 " + (100 + intencity) + "%");
    }
  };

  your_speed.change(() => {
    UpdateMinMax(your_speed, your_speed_min, your_speed_max);
  });
  enemy_speed.change(() => {
    UpdateMinMax(enemy_speed, enemy_speed_min, enemy_speed_max);
  });
  gen_method.change(() => {
    UpdateMinMaxBoth();
    UpdateGenMethodRate();
  });
  gen_intencity.change(() => {
    UpdateMinMaxBoth();
    UpdateGenMethodRate();
  });

  perform.click(() => {
    let win_count = 0;
    let intencity = Number(gen_intencity.val()) / 100.0;
    let method = Number(gen_method.val());
    let times = parseInt(gen_times.val());
    for (let lp = 0; lp < times; ++lp)
    {
      let s0 = Number(your_speed.val());
      let s1 = Number(enemy_speed.val());
      if (method == 1){
        s0 = s0 - s0 * intencity * mt.next();
        s1 = s1 - s1 * intencity * mt.next();
      }else{
        s0 = s0 - s0 * intencity * (0.5 - mt.next()) * 2;
        s1 = s1 + s1 * intencity * (0.5 - mt.next()) * 2;
      }
      if (s0 > s1){
        ++win_count;
      }
    }
    let win_rate = Math.floor(win_count / times * 100);
    your_win_rate.text(win_rate + "%" + "  (" + win_count + ")");
    enemy_win_rate.text((100 - win_rate) + "%" + "  (" + (times - win_count) + ")");
  });

  your_speed.val(3000);
  enemy_speed.val(3000);
  UpdateMinMaxBoth();
  UpdateGenMethodRate();
});