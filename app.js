var foods = [];
var mealItems = [];
var goals = {
	protein: 46,
	carbs: 30,
	fat: 11,
	calories: 409
};

function initFoods(){
	foods.push(new Food("Oats", .17, .66, .07, 3.89));
	foods.push(new Food("Chicken", .2177, 0, .0161, 1.129));
	foods.push(new Food("Flax Seeds", .1429, 0.2857, 0.4286, 5.2857));
	foods.push(new Food("Egg w/ Yolk", 0.13, 0.01, 0.1, 1.43, 50));
	foods.push(new Food("Eggwhites", 0.13, 0, 0, 0.5272));
	foods.push(new Food("Nuts", 0.14, 0.11, 0.63, 6.66));
	foods.push(new Food("Vegetables", 0.0280, 0.1469, 0, 0.7343));
	foods.push(new Food("Whey", 0.7483, 0.1603, 0.01781, 4.5783));
	foods.push(new Food("Wiener", 0.13, 0, 0.24, 2.69, 60));
	foods.push(new Food("Fish Oil", 0, 0, 1, 9.02));
	foods.push(new Food("Salmon frozen", 0.17, 0, 0.008, 0.7526));
	foods.push(new Food("Salmon smoked", 0.21, 0, 0.11, 1.8));
	foods.push(new Food("Cottage Cheese light", 0.12, 0.035, 0.005, 0.67));
	foods.push(new Food("Bread (Rye)", 0.09, 0.48, 0.03, 2.59));
	foods.push(new Food("Beans", 0.19, 0.39, 0.02, 2.35));
}

class Food{
	constructor(name, protein, carbs, fat, calories, weight=1){
		this.name = name; 
		//per gram of food
		this.protein = protein;
		this.carbs = carbs;
		this.fat = fat;
		this.calories = calories;
		//weight in g if food is not splittable, usually 1
		this.weight = weight;
	}
}

class MealItem{
	constructor(item){
		if(item instanceof MealItem){//copy object
			this.food = item.food;
			this.amount = item.amount;
			this.amountMin = item.amountMin;
		}else{
			this.food = item;
			this.amount = 0;
			this.amountMin = 0;
		}
	}
	
	get amountUsed(){
		return Math.max(this.amount, this.amountMin);
	}
	
	get amountGrams(){
		return (this.amountUsed * this.food.weight);
	}
	
	get protein(){
		return (this.amountGrams * this.food.protein);
	}
	
	get carbs(){
		return (this.amountGrams * this.food.carbs);
	}
	
	get fat(){
		return (this.amountGrams * this.food.fat);
	}
	
	get calories(){
		return (this.amountGrams * this.food.calories);
	}
}

function addFood(foodIndex){
	let food = foods[foodIndex];
	
	for(let i=0; i<mealItems.length; i++){
		if(mealItems[i].food === food)
			return;
	}
		
	mealItems.push(new MealItem(food));
}

function getMealTotal(meal){
	let totalWeight = 0;
	let totalProtein = 0;
	let totalCarbs = 0;
	let totalFat = 0;
	let totalCalories = 0;
	for(let m of meal){
		totalWeight += m.amountGrams;
		totalProtein += m.protein;
		totalCarbs += m.carbs;
		totalFat += m.fat;
		totalCalories += m.calories;
	}
	
	return {
		weight: totalWeight,
		protein: totalProtein,
		carbs: totalCarbs,
		fat: totalFat,
		calories: totalCalories
	};
}

function getGoalDelta(goals, total){
	return {
		protein: goals.protein - total.protein,
		carbs: goals.carbs - total.carbs,
		fat: goals.fat - total.fat,
		calories: goals.calories - total.calories
	};
}

function onFoodSelect(index){
	updateFoodInfo(index);
}

function onAddFood(){
	addFood(getFoodSelectIndex());
	updateMealTable();
	storeFoodListCookie();
}

function onFoodWeightChange(value){
	if(!isNaN(value)){
		let food = foods[getFoodSelectIndex()];
		food.weight = value;
	}
	updateMealTable();
}

function onMealItemAmountMin(miIndex, amountMin){
	if(!isNaN(amountMin)){
		let mi = mealItems[miIndex];
		mi.amountMin = amountMin;
	}
	updateMealTable();
}

function onMealItemAmount(miIndex, amount){
	if(!isNaN(amount)){
		let mi = mealItems[miIndex];
		mi.amount = amount;
	}
	updateMealTable();
}

function onMealItemRemove(miIndex){
	mealItems.splice(miIndex, 1);
	updateMealTable();
	storeFoodListCookie();
}

function onGoalChange(type, value){
	if(!isNaN(value) && value > 0){
		switch(type){
			case "protein":
				goals.protein = value;
				break;
			case "carbs":
				goals.carbs = value;
				break;
			case "fat":
				goals.fat = value;
				break;
			case "calories":
				goals.calories = value;
				break;
		}
	}
	storeGoalCookie();
	updateDeltaTable();
}

function initFoodSelect(){
	let foodSelect = document.getElementById("foodSelect");
	let option;
	for(let i=0; i<foods.length; i++){
		option = document.createElement("option");
		option.text = foods[i].name;
		foodSelect.add(option, foodSelect[i]);
	}
}

function getFoodSelectIndex(){
	let foodSelect = document.getElementById("foodSelect");
	return foodSelect.selectedIndex;
}

function addTableCell(tr, text){
	let td = document.createElement("td");
	td.appendChild(document.createTextNode(text));
	tr.appendChild(td);
}

function addTableCellInput(tr, text, onchange, type="text"){
	let td = document.createElement("td");
	let inp = document.createElement("input");
	inp.type = type;
	inp.value = text;
	inp.onchange = onchange;
	td.appendChild(inp);
	tr.appendChild(td);
}

function addTableCellButton(tr, text, onclick){
	let td = document.createElement("td");
	let btn = document.createElement("button");
	btn.innerText = text;
	btn.onclick = onclick;
	td.appendChild(btn);
	tr.appendChild(td);
}

function updateFoodInfo(foodIndex){
	let protein = document.getElementById("foodProtein");
	let carbs = document.getElementById("foodCarbs");
	let fat = document.getElementById("foodFat");
	let calories = document.getElementById("foodCalories");
	let weight = document.getElementById("foodWeight");
	protein.value = foods[foodIndex].protein;
	carbs.value = foods[foodIndex].carbs;
	fat.value = foods[foodIndex].fat;
	calories.value = foods[foodIndex].calories;
	weight.value = foods[foodIndex].weight;
}

function addMealTableRow(i){
	let mi = mealItems[i];
	let mealTable = document.getElementById("mealTable");
	let tr = document.createElement("tr");
	
	addTableCell(tr, mi.food.name);
	addTableCellInput(tr, mi.amount, function(){onMealItemAmount(i, this.value);}, "number");
	addTableCellInput(tr, mi.amountMin, function(){onMealItemAmountMin(i, this.value);}, "number");
		
	let items = [mi.amountUsed, mi.amountGrams, mi.protein, mi.carbs, mi.fat, mi.calories];
	for(let x of items)
		addTableCell(tr, Math.round(x * 100) / 100);
		
	addTableCellButton(tr, "Remove", function(){onMealItemRemove(i);});
		
	mealTable.appendChild(tr);
}

function addMealTableTotalRow(){
	let total = getMealTotal(mealItems);
	let tr = document.createElement("tr");
	tr.classList.add("total");
	
	for(let i=0; i<4; i++)
		addTableCell(tr, "");
		
	let items = [total.weight, total.protein, total.carbs, total.fat, total.calories];
	for(let i of items)
		addTableCell(tr, Math.round(i * 100) / 100);
		
	mealTable.appendChild(tr);
}

function updateMealTable(){
	let mealTable = document.getElementById("mealTable");
	//remove old mis
	while(mealTable.rows.length > 1)
		mealTable.deleteRow(1);
	
	for(let i=0; i<mealItems.length; i++)
		addMealTableRow(i);
	
	addMealTableTotalRow();
	
	updateDeltaTable();
}

function updateDeltaTable(){
	let deltaTable = document.getElementById("deltaTable");
	
	while(deltaTable.rows.length > 2)
		deltaTable.deleteRow(2);
	
	let goalProtein = document.getElementById("goalProtein");
	let goalCarbs = document.getElementById("goalCarbs");
	let goalFat = document.getElementById("goalFat");
	let goalCalories = document.getElementById("goalCalories");
	
	goalProtein.value = goals.protein;
	goalCarbs.value = goals.carbs;
	goalFat.value = goals.fat;
	goalCalories.value = goals.calories;
	
	let total = getMealTotal(mealItems);
	
	let tr = document.createElement("tr");
	addTableCell(tr, "-");
	
	let items = [total.protein, total.carbs, total.fat, total.calories];
	for(i of items)
		addTableCell(tr, Math.round(i*100)/100);
	deltaTable.appendChild(tr);
	
	let delta = getGoalDelta(goals, total);
	
	tr = document.createElement("tr");
	tr.classList.add("total");
	
	addTableCell(tr, "");
	items = [delta.protein, delta.carbs, delta.fat, delta.calories];
	for(i of items)
		addTableCell(tr, Math.round(i*100)/100);
	addTableCell(tr, "(" + Math.round(getWeightedTotalDelta(mealItems)*100)/100 + ")");
	deltaTable.appendChild(tr);
}

function setCookie(name, value, days){
	let d = new Date();
	d.setTime(d.getTime() + (days*24*60*60*1000));
	let expires = "expires=" + d.toUTCString();
	document.cookie = name + "=" + value + ";" + expires + "; path=/";
}

function readCookie(name){
	let nameEQ = name + "=";
	let s = document.cookie.split(";");
	for(let i=0; i<s.length; i++){
		let c = s[i];
		let o = c.indexOf(nameEQ);
		if(o >= 0){
			c = c.substring(o, c.length);
			return c.substring(nameEQ.length, c.length);
		}
	}
	return null;
}

function storeFoodListCookie(){
	let foodList = [];
	for(let i=0; i<mealItems.length; i++){
		foodList.push(foods.findIndex(f => f === mealItems[i].food));
	}
	
	setCookie("foodList" ,JSON.stringify(foodList), 30);
}

function loadFoodListCookie(){
	let items = JSON.parse(readCookie("foodList"));
	if(items == null)
		return;
	for(let i of items){
		addFood(i);
	}
}

function storeGoalCookie(){
	setCookie("goals", JSON.stringify(goals), 30);
}

function loadGoalCookie(){
	let g = JSON.parse(readCookie("goals"))
	if(g == null)
		return;
	goals = g;
}

function copyMeal(meal){
	let array = [];
	for(let i=0; i<meal.length; i++){
		array.push(new MealItem(meal[i]));
	}
	return array;
}

function genIndividual(){
	let array = copyMeal(mealItems);
	for(let i=0; i<array.length; i++){
		array[i].amount = Math.floor((Math.random() * 500) / array[i].food.weight);
	}
	return array;
}

function getWeightedTotalDelta(meal, goal=goals){
	let total = getMealTotal(meal);
	let delta = getGoalDelta(goal, total);
	
	let weightFactor = parseInt(goals.protein) + parseInt(goals.carbs) + parseInt(goals.fat);
	let proteinFactor = weightFactor/goals.protein;
	let carbsFactor = weightFactor/goals.carbs;
	let fatFactor = weightFactor/goals.fat;
	let caloriesFactor = weightFactor/goals.calories;
	
	let d = Math.abs(delta.protein * proteinFactor) +
		Math.abs(delta.carbs * carbsFactor) +
		Math.abs(delta.fat * fatFactor) +
		Math.abs(delta.calories * caloriesFactor);
	return d;
}

function getFitness(indv){
	let fitness = 0;
	return getWeightedTotalDelta(indv);
}

function mutate(indv){
	let mutatedIndex = Math.floor(Math.random() * indv.length);
	indv[mutatedIndex].amount = Math.floor((Math.random() * 500) / indv[mutatedIndex].food.weight);
	return indv;
}

function breedFunction(parent0, parent1){
	let protoParent = Math.round(Math.random());
	let newborn = copyMeal(protoParent==0?parent0:parent1);
	let breedPoint = Math.floor(Math.random() * parent0.length);
	
	let newValue = Math.floor((parent0[breedPoint].amount + parent1[breedPoint].amount) / 2);
	newborn[breedPoint].amount = newValue;
	return newborn;
}

function onOptimize(){
	if(mealItems.length <= 0)
		return;
		
	let toolbox = new Toolbox();
	toolbox.genIndv = genIndividual;
	toolbox.getFitness = getFitness;
	toolbox.goalFitness = Toolbox.fitnessMin;
	toolbox.mutate = mutate;
	
	let popSize = 2500;
	let mutProb = .5;
	let gens = 120;
	
	var gen = new GeneticAlgorithm(toolbox, popSize, mutProb, breedFunction, true);
	mealItems = gen.evolve(gens).population[0].individual;
	updateMealTable();
}


window.onload = function(){
	initFoods();
	loadFoodListCookie();
	loadGoalCookie();
	initFoodSelect();
	updateFoodInfo(getFoodSelectIndex());
	updateMealTable();
	updateDeltaTable();
};
