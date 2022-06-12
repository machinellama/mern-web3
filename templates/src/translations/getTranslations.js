import english from './english';
import japanese from './japanese';
import spanish from './spanish';

export default function (language) {
  switch (language) {
    case 'english':
      return english;
    case 'japanese':
      return japanese;
    case 'spanish':
      return spanish;
    default:
      return english;
  }
}
