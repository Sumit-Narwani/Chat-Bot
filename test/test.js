/* Created by:
    Sumit Narwani 08/10/2020
*/

async function getJoke() {
  const response = await fetch("http://api.icndb.com/jokes/random");
  const jsonResp = await response.json();
  return jsonResp;
}

async function getNews() {
  const response = await fetch(
    "http://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=1f09da11e1db403da69de2559b1313b6"
  );
  const jsonResp = await response.json();
  return jsonResp;
}
