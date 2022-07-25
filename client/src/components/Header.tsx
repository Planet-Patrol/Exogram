import { Person } from '@mui/icons-material';
import { UserContext } from '../App';

export function Header() {
  return (
    <div className="header">
      <HeaderAndFooterContent />
      <UserContext.Consumer>
        {(user) => {
          return (
            <a href={`/${!!user ? 'profile' : 'signin'}`}>
              <div className="profile">{<Person fontSize="large" />}</div>
            </a>
          );
        }}
      </UserContext.Consumer>
    </div>
  );
}

export function Footer() {
  return (
    <div className="footer">
      <HeaderAndFooterContent />
    </div>
  );
}

function HeaderAndFooterContent() {
  return (
    <div className="content">
      <div className="title">
        <a href="/">
          Exo<span>gram</span>
        </a>
      </div>
      <div className="links">
        <a href="/table">TIC Table</a>
        <div className="sep">/</div>
        <a href="/charts">TIC Charts</a>
        <div className="sep">/</div>
        <a href="/dictionary">Dictionary</a>
      </div>
    </div>
  );
}
