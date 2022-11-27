export default function log(...message: any[]) {
  //if (process.env.NODE_ENV === 'development') {
    console.debug(...message);
  //}
}