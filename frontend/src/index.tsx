import { Route, Router } from '@solidjs/router';
import { render } from 'solid-js/web';
import { Navigate } from '@solidjs/router';
import { SubmitPage } from './SubmitPage';
import { BoardPage } from './components/BoardPage';
import './app.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

render(
    () => (
        <Router>
            <Route path="/" component={BoardPage} />
            <Route path="/submit" component={SubmitPage} />
            <Route path="*" component={() => <Navigate href="/" />} />
        </Router>
    ),
    root,
);
