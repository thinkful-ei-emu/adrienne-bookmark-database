function bookmarksArray(){
  return [
    {id: 1, title:'Moby Dick',url:'http://www.disney.com',description:'a man battles a whale',rating:1},
    {id: 2, title:'Aladdin',url:'www.disney.com',description:'a homeless boy finds a lamp',rating:5}
  ];
}

function maliciousBookmark() {
  const maliciousBookmark = {
    id: 911,
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    url: 'https://www.hackers.com',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    rating: 1,
  };
  const expectedBookmark = {
    ...maliciousBookmark,
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  };
  return {
    maliciousBookmark,
    expectedBookmark
  }
}
module.exports = { bookmarksArray, maliciousBookmark };