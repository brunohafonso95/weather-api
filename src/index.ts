import App from './App';

const app = new App().init();
app.getApp().listen(app.getPort(), () => {
  console.log('server listening');
});
