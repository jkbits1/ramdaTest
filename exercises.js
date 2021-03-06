/**
 * Created by jk on 25/08/15.
 */

'use strict';

var _fantasy = fantasy;
var Maybe = _fantasy.Maybe;
var Either = _fantasy.Either;
var IO = _fantasy.IO;
var Future = _fantasy.Future;

var user = syncUser();

var subjects = [{
    title: 'Combinatory logic',
    description: 'Combinatory logic is a notation to eliminate the need for quantified variables in mathematical logic. It was introduced by Moses Schönfinkel[1] and Haskell Curry,[2] and has more recently been used in computer science as a theoretical model of computation and also as a basis for the design of functional programming languages. It is based on combinators. A combinator is a higher-order function that uses only function application and earlier defined combinators to define a result from its arguments.'
  }, {
    title: 'Curry–Howard correspondence',
    description: 'In programming language theory and proof theory, the Curry–Howard correspondence (also known as the Curry–Howard isomorphism or equivalence, or the proofs-as-programs and propositions- or formulae-as-types interpretation) is the direct relationship between computer programs and mathematical proofs. It is a generalization of a syntactic analogy between systems of formal logic and computational calculi that was first discovered by the American mathematician Haskell Curry and logician William Alvin Howard.[1] It is the link between logic and computation that is usually attributed to Curry and Howard, although the idea is related to the operational interpretation of intuitionistic logic given in various formulations by L. E. J. Brouwer, Arend Heyting and Andrey Kolmogorov (see Brouwer–Heyting–Kolmogorov interpretation)[2] and Stephen Kleene (see Realizability). The relationship has been extended to include category theory as the three-way Curry–Howard–Lambek correspondence.'
  }, {
    title: 'Curry\'s paradox'
}];

/************************************************************

 Hello Functional JS London

 ************************************************************/

/*----------------------------------------------------------

 Currying

 In mathematics and computer science, currying is the
 technique of translating the evaluation of a function that
 takes multiple arguments into evaluating a sequence of functions,
 each with a single argument. It was introduced by Moses
 Schönfinkel and later developed by Haskell Curry. (Wikipedia)

 -----------------------------------------------------------*/

//∆ mult :: Number -> Number -> Number
var mult = function mult (x) {
  return y => x * y;
};

//∆ multBy4 :: Number -> Number
var multBy4 = mult(4);

assertEqual(12, multBy4(3));
assertEqual(12, mult(4)(3)); // ugly, isn't it?

// Ramda to the rescue (lodash has it as well)

//∆ multR :: Number -> Number -> Number
var multR = R.curry( (x, y) => x * y );

//∆ multRBy4 :: Number -> Number
// original test uses previous function
// var multRBy4 = mult(4);
var multRBy4 = multR(4);

assertEqual(12, multRBy4(3));
assertEqual(12, multR(4, 3)); // neat

//∆ modulo :: Number -> Number -> Number
var modulo = R.curry( (divisor, dividend) => dividend % divisor );

var isOdd = modulo(2);

assertEqual(0, isOdd(8));

// Haskell(ish)
// unique = Data.List.nub
// index names = unique $ map (\name -> head name) names

// Lodash
var index = function index (names) {
  return _.unique(_.map(names, name => _.first(name) ));
};

assertEqual(['A', 'J'], index(['Ann', 'Jim', 'Jennifer']));

//Ramda
var indexR = R.compose(R.uniq, R.map(R.head));

//jk stuff - start
var hd = R.head;

var mapHead = R.map(R.head);

console.log(mapHead(['Tab', 'Mark']));
//jk stuff - end

//jk stuff2 -start

// Haskell(ish)
// unique = Data.List.nub
// index names = unique $ map (\name -> head name) names

// Underscore
var indexR2 = (names) => {
  return _.chain(names)
    .map( name => _.first(name) )
    .unique()
    .value();
}

assertEqual(['T', 'M'], indexR2(['Tab', 'Mark', 'Mike']));

console.log(indexR2(['Tab', 'Mark', 'Mike']));
//jk stuff2 -end

// This code reads better. In fact I wish could read this kind of code all day
assertEqual(['A', 'J'], indexR(['Ann', 'Jim', 'Jennifer']));

console.log('*** Currying: OK');

/************************************************
 Currying
 - Generic functions
 - New functions from partially applying args
 - Terse but clear definitions

 *************************************************/

/*----------------------- Part 2 --------------------------

 Composition

 In mathematics, function composition is the pointwise application
 of one function to the result of another to produce a third function.
 (Wikipedia)
 -----------------------------------------------------------*/

/*-----------------------------------------------------------

 1. The usual way

 ------------------------------------------------------------*/

// jk - rewriting args for clarity/possible bug - start

// NOTE: the functions below include code to filter subjects, but the sample data means that 
//       the filtered results are the same as the original data. Still, the assertEqual does check for this result.

function getSubjectsU_orig (user) {
  var subjectTitles = user.knownFor;

  var _subjects = [];
  
  subjectTitles.forEach( (subject) => syncSubject(subject) );

  return subjects;
}

function getSubjectsU (user) {
  var subjectTitles = user.knownFor;
  // knownFor: ['Combinatory logic', 'Curry–Howard correspondence', 'Curry\'s paradox'],

  // Haskell(ish)
  // syncSubject title = filter ( \subj = subj.title == title ) subjects
  // userSubjects = map syncSubject subjectTitles

  // should forEach push, or be a map?
  var _subjects =
    //[];
    //subjectTitles.forEach(function (title) {
    subjectTitles.map( title => syncSubject(title) );

  // assuming this is a typo
  //return subjects;
  return _subjects;
}
// jk - rewriting args for clarity/possible bug - end


assertEqual(subjects, getSubjectsU(user));

console.log('*** Vanilla Composition: OK');

/************************************************************

 2. The lodash/underscore way

 ************************************************************/

function getSubjectsL (user) {
  var subjectTitles = _.get(user, 'knownFor');

  // Haskell(ish)
  // syncSubject title = filter ( \subj = subj.title == title ) subjects
  // userSubjects = map syncSubject subjectTitles

  return _.map(subjectTitles, syncSubject);
}

//lodash's 'map' first argument is a function,
// to compose _.map and _.get we have to curryRight but...
var mapC = _.curryRight(_.map); //Nope :-/
var getC = _.curryRight(_.get); //Nope :-/

//_.map has [this] context as the last argument
// so we can't really curry it

var getSubjectsLC = _.flowRight(mapC(syncSubject), getC('knownFor'));

// we have to do this
var getSubjectsLCh = function getSubjectsLCh (x) {
  return _(x).get('knownFor').map(syncSubject);
};

assertEqual(subjects, getSubjectsLCh(user));

console.log('*** Lodash Composition: OK ');

/***********************************************

 3. The ramda way

 ***********************************************/

  // Haskell(ish)
  // syncSubject title = filter ( \subj = subj.title == title ) subjects
  // userSubjects = map syncSubject subjectTitles

var getSubjectsR = R.compose(R.map(syncSubject), R.prop('knownFor'));

assertEqual(subjects, getSubjectsR(user));

console.log('*** Ramda Composition: Amazing');

/***********************************************

 4. Exercises

 -------------
 4.0 Write a function that returns a list of the directors
 first names if their name is 5 letters long (really useful one)

 ***********************************************/

var films = [{
  title: 'Citizen Kane',
  rating: 8.4,
  releaseYear: 1941,
  director: 'Orson Welles'
}, {
  title: 'Fight Club',
  rating: 8.9,
  releaseYear: 1999,
  director: 'David Fincher'
}, {
  title: 'Beautiful Mind',
  rating: 8.2,
  releaseYear: 2001,
  director: 'Ron Howard'
}, {
  title: 'Usual Suspects',
  rating: 8.6,
  releaseYear: 1995,
  director: 'Bryan Singer'
}];

// jk start
// filter (\name -> name.length == 5) $ map (\film -> firstN film.director) films

// firstN name = head $ name.split('')  
function firstName (name) {
  // Haskell(ish) version
  // syncSubject title = filter ( \subj = subj.title == title ) subjects

  // doesn't work
  // return R.compose(R.nth(0), R.split(" ", name))();
  return R.compose(R.nth(0), R.split(" "))(name);
}

// var getNames = R.compose(R.map(firstName), R.map(R.prop('director')));
var getNames = R.compose(R.filter(name => name.length === 5), R.map(firstName), R.map(R.prop('director')));

console.log("getNames: ", getNames(films));

assertEqual(['Orson', 'David', 'Bryan'], getNames(films));

// jk end

//∆ directors :: [Object] -> [String]
var directors = R.map(R.compose(R.head, R.split(' '), R.prop('director')));

var length5 = R.compose(R.equals(5), R.length);

var directors5 = R.compose(R.filter(length5), directors);

assertEqual(['Orson', 'David', 'Bryan'], directors5(films));
console.log('*** Composition Exercise 0: OK');

/*******************************************
 4.1 Write a function that sorts films in the array
 by rating and returns an array of their names

 ***********************************************/

//  jk start

// map (\f -> f.name) $ sort (\f1 f2 -> f1.rating < f2.rating )  films

// var sortByRating = R.sort((f1, f2) => f1.rating > f2.rating);
var filmNamesByRating = R.compose(R.map(f => f.title), R.sort((f1, f2) => f1.rating > f2.rating));

var ratedFilms = filmNamesByRating(films);

//  jk end

//lodash way
var sortedFilmsL = function sortedFilmsL (fs) {
  return _.chain(fs).sortBy( film => film.rating ).map( film => film.title ).value();
};

assertEqual(["Beautiful Mind", "Citizen Kane", "Usual Suspects", "Fight Club"], sortedFilmsL(films));

// var sortedFilmsR = null; //????

//∆ sortedFilmsR :: [Object] -> [String]
var sortedFilmsR = R.compose(R.map(R.prop('title')), R.sortBy(R.prop('rating')));

assertEqual(sortedFilmsL(films), sortedFilmsR(films));
console.log('*** Composition Exercise 1: OK');

/*

 4.2 Write a function that returns the latest film
 title and release year for the film with rating higher than 8.6

 */

//  jk start

//  latest = head $ sort (\f -> f.releaseYear) $ filter (\f -> f.rating > 8.6)
// latestInfo latest = (latest.title, latest.releaseYear)

var latest = R.compose(R.nth(0), R.sort((f1, f2) => f1.releaseYear > f2.releaseYear), R.filter((f => f.rating > 8.6)));

// make rating a param
var latest2 = (rating) => {
  return R.compose(R.head, R.sort((f1, f2) => f1.releaseYear < f2.releaseYear), R.filter((f => f.rating > rating)));
} 

// var latestInfo = latest (films);
var latestInfo86 = latest2 (8.3);
var latestInfo = latestInfo86 (films);

var latestInfoPair = {
  title: latestInfo.title,
  releaseYear: latestInfo.releaseYear
}

//  jk end


//∆ ratingHigherThan :: Number -> (Object -> Boolean)
var ratingHigherThan = function ratingHigherThan (rating) {
  return R.compose(R.lte(rating), R.prop('rating'));
};

//∆ latestGood :: [Object] -> String
var latestGood = 
  R.compose( film => film.title + ': ' + film.releaseYear, 
  R.last, R.sortBy(R.prop('releaseYear')), R.filter(ratingHigherThan(8.6)));

assertEqual('Fight Club: 1999', latestGood(films));
console.log('*** Composition Exercise 2: OK');

/*

 4.3 Write a function that returns the latest film
 title and release year for the film with rating higher than 8.6

jk NOTE: duplicate of 4.2

 */

//∆ ratingHigherThan :: Number -> (Object -> Boolean)
var ratingHigherThan = function ratingHigherThan(rating) {
  return R.compose(R.lte(rating), R.prop('rating'));
};

//∆ latestGood :: [Object] -> String
var latestGood = 
  R.compose( film => film.title + ': ' + film.releaseYear, 
  R.last, R.sortBy(R.prop('releaseYear')), R.filter(ratingHigherThan(8.6)));

assertEqual('Fight Club: 1999', latestGood(films));
console.log('*** Composition Exercise 3: OK');

/*

 4.4 Write a function that returns the year of the earliest
 release in the list
 */

// jk start

// earliestByYear = head $ sort (\f1, f2 -> f1.releaseYear > f2.releaseYear)
// (earliestByYear films).releaseYear

var earliestByYear = R.compose(R.prop('releaseYear'), R.head, R.sort((f1, f2) => f1.releaseYear > f2.releaseYear));

var earliestByYearInfo = earliestByYear(films);

// reduce version

// jk end


//∆ earliest :: [Object] -> Number
var earliest = R.compose(R.reduce(R.min, 2015), R.map(R.prop('releaseYear')));

assertEqual(1941, earliest(films));
console.log('*** Composition Exercise 4: OK');

/*

 4.5 Converge
 */

var myFilms = {
  allFilms: films,
  notGoodForMyGirlfriend: null
};

//Write a function that will add any film older than
// 1999 to an appropriate key

var yearBefore1999 = R.compose(R.lte(1999), R.prop('releaseYear'));

var separateFilms = R.converge(R.assoc('notGoodForMyGirlfriend'), R.compose(R.reject(yearBefore1999), R.prop('allFilms')), R.identity);

assertEqualArrays({
  allFilms: films,
  notGoodForMyGirlfriend: [{
    title: 'Citizen Kane',
    rating: 8.4,
    releaseYear: 1941,
    director: 'Orson Welles'
  }, {
    title: 'Usual Suspects',
    rating: 8.6,
    releaseYear: 1995,
    director: 'Bryan Singer'
  }] }, separateFilms(myFilms)
);

console.log('*** Composition Exercise 5: OK');

/************************************************
 Composition
 - Create new 'specific' functions from 'generic' building blocks
 - Point free helps to create generic programs
 - High level

 *************************************************/

/*----------------------- Part 3 --------------------------

 Fantasy Land
 (aka "Algebraic JavaScript Specification")

 -----------------------------------------------------------*/

/***********************************************

 1. Functors

 ***********************************************/

var arr = [2];

var add1 = R.add(1);

//[2] -> [R.add1(2)]

console.log('arr + 1: ' + R.map(add1, arr));

// map :: (a -> b) -> [a] -> [b]

var Box = function Box (v) {
  this.value = v;
};

Box.prototype.map = f => new Box( f( this.value ) );

var two = new Box(2);

console.log('Box + 1: ' + R.compose(R.prop('value'), R.map(add1))(two));

// map :: Functor f => (a -> b) -> f a -> f b

//∆ uptown :: Object -> String
var uptown = R.compose(R.toUpper, R.prop('town')); //Throw

//∆ upname :: Object -> Maybe String
var upname = R.compose(R.map(R.toUpper), Maybe, R.prop('firstName'));

// console.log(uptown(syncUser()).toString());

//∆ upsurname :: Object -> Either String String
var upsurname = R.compose(R.map(R.toUpper), Either('NotCurry'), R.prop('lastName'));

console.log(upsurname(syncUser()).toString());

/***********************************************

 2. Exercises

 */

/***************************************
 2.0
 Write a function that gets a name beginning
 with M and lowercases it
 ***********************************************/

var names = ['John', 'Marry', 'Ann'];

var letters = R.compose(R.map(R.toLower), Maybe, R.head, R.filter(R.equals('M')), R.map(R.head));

assertEqual(Maybe('m'), letters(names));
console.log('*** Functors Exercise 0: OK');

/***************************************
 2.1 Write a function that turns a list of names
 into a list of names' first letters
 ***********************************************/

var names = ['John', 'Marry', 'Ann', undefined];
var notNothing = R.compose(R.not, R.invoker(0, 'isNothing'));

var letters = R.compose(R.commute(Maybe.of), R.filter(notNothing), R.map(R.map(R.head)), R.map(Maybe));

assertEqual(['J', 'M', 'A'], letters(names).getOrElse(null));
console.log('*** Functors Exercise 1: OK');

/***************************************
 2.2 Write a function that doesn't explode in your face
 when JSON.parse fails
 ***********************************************/

var names = "[\"John\", \"Marry\", \"Ann\", Harry\"]";

//∆ parse :: String -> Maybe Object
var parse = function parse (str) {
  try {
    return Maybe.Just(JSON.parse(str));
  } catch (e) {
    return Maybe.Nothing();
  }
};

var sortNamesLowercase = R.compose(R.map(R.toLower), R.sortBy(R.identity));

var processResponse = R.compose(R.map(sortNamesLowercase), parse);

assertEqual (Maybe(['ann', 'harry', 'john', 'marry']), processResponse(names));
console.log('*** Functors Exercise 2: OK');

/******************************************
 Utils
 *******************************************/

function flog () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  if (args.length > 1) {
    console.log(args[0], args[1].toString());
    return args[1];
  } else {
    console.log(args[0].toString());
    return args[0];
  }
}

/******************************************
 Testing helpers
 *******************************************/

function assertEqualArrays (x, y) {
  if (x.length !== y.length) throw "expected " + x + " to equal " + y;
  for (var i in x) {
    if (!R.equals(x[i], y[i])) {
      throw "expected " + x + " to equal " + y;
    }
  }
}
function assertEqual (x, y) {
  if (!R.equals(x, y)) throw "expected " + x + " to equal " + y;
}

/*****************************************

 Fake data

 ***************************************/

function syncUser () {
  return {
    firstName: 'Haskell',
    middleName: 'Brooks',
    lastName: 'Curry',
    dateOfBirth: 'Wed Sep 12 1900 00:00:00 GMT+0100 (BST)',
    dateOfDeath: 'Wed Sep 01 1982 00:00:00 GMT+0100 (BST)',
    knownFor: ['Combinatory logic', 'Curry–Howard correspondence', 'Curry\'s paradox'],
    parents: [{
      firstName: 'Samuel',
      middleName: 'Silas',
      lastName: 'Curry'
    }, {
      firstName: 'Anna',
      middleName: 'Baright',
      lastName: 'Curry'
    }]
  };
}

function syncSubject (title) {
  // Haskell(ish) version
  // syncSubject title = filter ( \subj = subj.title == title ) subjects

  return R.compose(R.nth(0), R.filter( subj => subj.title === title )) (subjects);
}