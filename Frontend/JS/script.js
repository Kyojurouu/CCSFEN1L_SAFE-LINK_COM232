document.getElementById('y').textContent = new Date().getFullYear();
 
    function showScanner() {
      document.querySelector('.hero').style.display = 'none';
      document.querySelector('#features').style.display = 'none';
      document.querySelector('.help-section').style.display = 'none';
      document.querySelector('.scanner-section').style.display = 'block';
      window.scrollTo(0, 0);
    }
 
    function showHome() {
      document.querySelector('.hero').style.display = 'grid';
      document.querySelector('#features').style.display = 'block';
      document.querySelector('.scanner-section').style.display = 'none';
      document.querySelector('.help-section').style.display = 'none';
      document.getElementById('results').innerHTML = '';
      document.getElementById('url-input').value = '';
      window.scrollTo(0, 0);
    }
 
    function showHelp() {
      document.querySelector('.hero').style.display = 'none';
      document.querySelector('#features').style.display = 'none';
      document.querySelector('.scanner-section').style.display = 'none';
      document.querySelector('.help-section').style.display = 'block';
      window.scrollTo(0, 0);
    }