import { useEffect, useState } from 'react';
import { getDictionary } from '../firebase/databaseHandler';
import { generateDefinableTermsFromText } from './DefinableTerm';

export default function TicDisposition(props: { data: any }) {
  const [dictionary, setDictionary] = useState<any[]>([]);

  useEffect(() => {
    getDictionary().then(setDictionary);
  }, []);

  return (
    <div className="disposition-wrapper">
      <div className="disposition">
        {props.data.name && <div className="name">{props.data.name}</div>}
        <div className="value">{props.data.disposition}</div>
        {props.data.comments && <div className="comments">{generateDefinableTermsFromText(props.data.comments, dictionary)}</div>}
      </div>
    </div>
  );
}
