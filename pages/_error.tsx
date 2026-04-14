// pages/_error.tsx
import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <h1>{statusCode || 'Error'}</h1>
      <p>
        {statusCode === 404
          ? 'The page you are looking for does not exist.'
          : 'Something went wrong. Please try again later.'}
      </p>
      <a href="/">Go Home</a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;