import { useState, useEffect } from 'react';
import { getDictionary, useUsers } from '../handlers/databaseHandler';
import { generateDefinableTermsFromText } from './DefinableTerm';

export default function TicDispositionTable(props: { data: any; paperDisposition?: any }) {
  const users = useUsers();

  const [dictionary, setDictionary] = useState<any[]>([]);

  useEffect(() => {
    getDictionary().then(setDictionary);
  }, []);

  return (
    <div className="tic-disposition-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Disposition</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {props.paperDisposition && <TicDispositionTableRow paper users={users} dictionary={dictionary} data={props.paperDisposition} />}
          {Object.keys(props.data)
            .sort()
            .map((k: any) => (
              <TicDispositionTableRow data={props.data[k]} users={users} key={k} dictionary={dictionary} />
            ))}
        </tbody>
      </table>
    </div>
  );
}

function TicDispositionTableRow(props: { data: any; users: any; dictionary: any[]; paper?: boolean }) {
  return (
    <tr className={`${props.paper ? 'paper' : ''}`}>
      <td>
        {props.paper
          ? 'Paper'
          : isNaN(props.data.userId)
          ? props.data.userId[0].toUpperCase() + props.data.userId.substring(1) // Crazy, I know lol
          : props.users?.filter((u: any) => u.id === props.data.userId)[0]?.name}
      </td>
      <td>{generateDefinableTermsFromText(props.data.disposition, props.dictionary)}</td>
      <td>{generateDefinableTermsFromText(props.data.comments, props.dictionary)}</td>
    </tr>
  );
}
