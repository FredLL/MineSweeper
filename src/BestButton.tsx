import * as React from 'react';
import { localStorageAvailable, getBestResult, ListElt, listResults } from './LocalStorage';

interface BestButtonProps{
  mode: string;
}
export const BestButton:React.FC<BestButtonProps> = ({mode}) => {
  if (!localStorageAvailable()) {
    return null;
  }
  const modalRef = React.useRef<HTMLDivElement>(null);
  const bestRes = getBestResult(mode);
  const [list, setList] = React.useState<ListElt[]>([])
  const showModal = () => {
    setList(listResults());
    modalRef.current.style.display = 'block';
  }
  const hideModal = () => {
    modalRef.current.style.display = 'none';
  }
  window.onclick = (event:MouseEvent) => {
    if (event.target == modalRef.current) {
      modalRef.current.style.display = 'none';
    }
  }
  return <>
    <div className="far-right">
      <button onClick={showModal}>{bestRes}</button>
    </div>
    <div ref={modalRef} className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <span className="close" onClick={hideModal}>&times;</span>
          <h2>Results</h2>
        </div>
        <div className="modal-body">
          {!list.length && <p>No results yet</p>}
          {!!list.length && <table style={{width: '100%'}}>
              <thead><tr>{Object.keys(list[0]).map((key, idx) => <td style={{width: '25%'}} key={'title-'+idx}>{key}</td>)}</tr></thead>
              <tbody>{list.map((result, idx) => <tr key={'row-'+idx}>{Object.values(result).map((val, idxc) => <td key={'cell-'+idx+'-'+idxc}>{val}</td>)}</tr>)}</tbody>
            </table>}
        </div>
      </div>
    </div>
  </>
}