<?php

  $data_dir = 'Users';
  $file_dir = 'all_unannotated_xmls';
  $unannotated_dir = 'unannotated_xmls';
  $record = fopen('file_distribution_record.txt', 'w');
  $users = scandir($data_dir);
  $actual_users = array_values(array_diff($users, array('Reconciliation', 'Test', '.', '..')));
  $file_list = array_values(array_diff(scandir($file_dir), array('.', '..')));
  shuffle($file_list);
  for($i = 0; $i < count($actual_users); $i++) {
    if(!file_exists($unannotated_dir.'/'.$actual_users[$i])) {
      mkdir($unannotated_dir.'/'.$actual_users[$i], 0777);
    }
  }
  $i = 0;
  $j = 0;
  $k = 1;
  while($i < count($file_list)) {
    fwrite($record, $actual_users[$j]."\t".$actual_users[$k]."\t".$file_list[$i]."\n");
    copy($file_dir.'/'.$file_list[$i], $unannotated_dir.'/'.$actual_users[$j].'/'.$file_list[$i]);
    copy($file_dir.'/'.$file_list[$i], $unannotated_dir.'/'.$actual_users[$k].'/'.$file_list[$i]);
    $k++;
    if($k == count($actual_users)){
      $j++;
      if($j == count($actual_users) - 1) {
        $j = 0;
        $k = 1;
      }else{
        $k = $j + 1;
      }
    }
    $i++;
  }
  fclose($record);
?>
