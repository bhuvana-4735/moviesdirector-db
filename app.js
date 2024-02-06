const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
const dbpath = path.join(__dirname, 'moviesData.db')
let db = null
app.use(express.json())
const InitializeAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB error: ${error.message}`)
    process.exit(1)
  }
}
InitializeAndServer()
const convertDbToResObj = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}
const convertDirectorDbToResObj = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

//get api1
app.get('/movies/', async (request, response) => {
  const getMoviesNames = `
    select movie_name from movie `
  const moviearr = await db.all(getMoviesNames)
  response.send(moviearr.map(eachmovie => convertDbToResObj(eachmovie)))
})

//post api2
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovieQuery = `
insert into movie(director_id,movie_name,lead_actor)values(
  ${directorId},
  '${movieName}',
  '${leadActor}'
);`
  await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

//get movie based on movie_id api3
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMoviesQuery = `
    SELECT
     *
    FROM
     movie
    WHERE
      movie_id = ${movieId};`
  const movieArray = await db.get(getMoviesQuery)
  response.send(convertDbToResObj(movieArray))
})

//update put api4
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const updatemovieDetails = request.body
  const {directorId, movieName, leadActor} = updatemovieDetails
  const updatemovieQuery = `
    UPDATE
      movie
    SET
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor= '${leadActor}',
    WHERE
     movie_id = ${movieId}`
  await db.run(updatemovieQuery)
  response.send('Movie Details Updated')
})

//delete api5

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//api6 get all directors

app.get('/directors/', async (request, response) => {
  const getdirectorsQuery = `
   select * 
   from
    director `
  const directorarr = await db.all(getdirectorsQuery)
  response.send(
    directorarr.map(eachdirector => convertDirectorDbToResObj(eachdirector)),
  )
})

//api7 Returns a list of all movie names directed by a specific director
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getdirectorsMoviesQuery = `
   select movie_name
   from
    movie 
    where 
    director_id="${directorId}" `
  const moviedirectorarr = await db.all(getdirectorsMoviesQuery)
  response.send(
    directorarr.map(eachmovie => ({movieName: eachmovie.movie_name})),
  )
})
module.exports = app
