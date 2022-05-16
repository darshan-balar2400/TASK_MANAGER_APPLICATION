const app = require("./app");

const port = process.env.PORT || 8000;

app.listen(port,(err) => {
    if(err) return err;
    console.log(`Listening on port ${port}`);
});