import english from './english';
import japanese from './japanese';

export default function (language) {
  switch (language) {
    case 'english':
      return english;
    case 'japanese':
      return japanese;
    default:
      return english;
  }
}
