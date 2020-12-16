
function listAPI(api) {
	console.log(`%c API ${String(api)}`, 'background: #222; color: #bada55');
  for (let key in api) {
    const keyType = typeof api[key];
    switch(keyType) {
      case 'function': break;
      case 'object':
				listAPI(api[key]);
				break;
			case 'boolean':
			case 'number':
      case 'string': 
        console.log(`${key}: ${api[key]}`);
      break;
      default:
				console.info(keyType);
				break;
    }
  }
}

listAPI(window.location);
listAPI(window.navigator);
listAPI(window.performance);