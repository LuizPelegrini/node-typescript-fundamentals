import app from './app';
import './database';
import 'reflect-metadata'; // necessary for Typescript decorators

app.listen(3333, () => {
  console.log('🚀 Server started on port 3333!');
});
