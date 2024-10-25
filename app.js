const express = require('express')
const app = express()
const handlebars = require('express-handlebars').engine
const bodyParser = require('body-parser')
const Handlebars = require('handlebars')

const {
  initializeApp,
  applicationDefault,
  cert
} = require('firebase-admin/app')
const {
  getFirestore,
  Timestamp,
  FieldValue
} = require('firebase-admin/firestore')

const serviceAccount = require('./firebaseConfiguration.json')

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

Handlebars.registerHelper('eq', function (v1, v2) {
  return v1 === v2
})

app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/cadastrar', function (req, res) {
  db.collection('clientes')
    .add({
      nome: req.body.nome,
      telefone: req.body.telefone,
      origem: req.body.origem,
      data_contato: req.body.data_contato,
      observacao: req.body.observacao
    })
    .then(function () {
      console.log('Dados cadastrados com sucesso!')
      res.redirect('/')
    })
})

app.post('/atualizar', function (req, res) {
  const id = req.body.id
  db.collection('clientes')
    .doc(id)
    .update({
      nome: req.body.nome,
      telefone: req.body.telefone,
      origem: req.body.origem,
      data_contato: req.body.data_contato,
      observacao: req.body.observacao
    })
    .then(function () {
      console.log('Documento atualizado com sucesso!')
      res.redirect('/consultar')
    })
})

app.post('/excluir', function (req, res) {
  const id = req.body.id
  db.collection('clientes')
    .doc(id)
    .delete()
    .then(function () {
      console.log('Excluido com sucesso!')
      res.redirect('/consultar')
    })
    .catch(function (error) {
      console.log(`Erro ao tentar excluir: ${error}`)
    })
})

app.get('/consultar', function (req, res) {
  var posts = []
  db.collection('clientes')
    .get()
    .then(function (snapshot) {
      snapshot.forEach(function (doc) {
        const data = doc.data()
        data.id = doc.id
        // console.log(data)
        posts.push(data)
      })
      res.render('consultar', { posts })
    })
})

app.get('/', function (req, res) {
  res.render('primeira_pagina')
})

app.get('/editar/:id', (req, res) => getById(req, res, 'editar'))

app.get('/excluir/:id', (req, res) => getById(req, res, 'excluir'))

function getById(req, res, route) {
  var posts = []
  const id = req.params.id
  db.collection('clientes')
    .doc(id)
    .get()
    .then(function (doc) {
      const data = doc.data()
      data.id = doc.id
      posts.push(data)
      res.render(route, { posts })
    })
}

app.listen(8081, function () {
  console.log('Servidor Ativo!')
})
