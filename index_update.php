<?php

  $data_dir = 'Users/';
  $user = '';
  $filename = 'PMC3016167';
  $xml = new DOMDocument();
  $xml->load($data_dir.$user."/".$filename.'.xml');
  $doc = $xml->getElementsByTagName('document');
  $sentences = $doc->item(0)->getElementsByTagName('sentence');
  foreach ($sentences as $sentence) {
    if($sentence->hasAttribute('selection')) {
      $selections = explode(" ",$sentence->getAttribute('selection'));
      for($i = 0; $i < count($selections); $i++){
        if(intval($selections[$i]) >= 2) {
          $selections[$i] = strval(intval($selections[$i]) + 1);
        }
      }
      $sentence->setAttribute('selection', join(' ', $selections));
    }

    echo $sentence->getAttribute('selection');
  }
  $xml->save($data_dir.$user."/".$filename.'.xml');
?>
