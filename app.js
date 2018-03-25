var foods = [];
var mealItems = [];
var goals = {
	protein: 46,
	carbs: 30,
	fat: 11,
	calories: 409
};
var customFood = {
	name: "",
	protein: 0,
	carbs: 0,
	fat: 0,
	calories: 0,
	weight: 1
}

function initFoods(){
	foods.push(new Food("Chicken", .2177, 0, .0161, 1.129));
	foods.push(new Food("Vegetables", 0.0280, 0.1469, 0, 0.7343));
	foods.push(new Food("Egg w/ Yolk", 0.13, 0.01, 0.1, 1.43, 50));
	foods.push(new Food("Eggwhites", 0.13, 0, 0, 0.5272));
	foods.push(new Food("Salmon frozen", 0.17, 0, 0.008, 0.7526));
	foods.push(new Food("Oats", .17, .66, .07, 3.89));
	foods.push(new Food("Flax Seeds", .1429, 0.2857, 0.4286, 5.2857));
	foods.push(new Food("Nuts", 0.14, 0.11, 0.63, 6.66));
	foods.push(new Food("Whey", 0.7483, 0.1603, 0.01781, 4.5783));
	foods.push(new Food("Potatoes boiled", 0.02, 0.2, 0, 0.87));
	foods.push(new Food("Rice(white)", 0.0132, 0.1410, 0.0176, 1.0573));
	foods.push(new Food("Rice(brown)", 0.0265, 0.2566, 0.0088, 1.2389));
	foods.push(new Food("Fish Oil", 0, 0, 1, 9.02));
	foods.push(new Food("Salmon smoked", 0.21, 0, 0.11, 1.8));
	foods.push(new Food("Cottage Cheese light", 0.12, 0.035, 0.005, 0.67));
	foods.push(new Food("Bread (Rye)", 0.09, 0.48, 0.03, 2.59));
	foods.push(new Food("Beans", 0.19, 0.39, 0.02, 2.35));
	foods.push(new Food("Wiener", 0.13, 0, 0.24, 2.69, 60));
}

class Food{
	constructor(food, protein, carbs, fat, calories, weight=1){
		let copy = food instanceof Food;
		this.name = copy?food.name:food; 
		//per gram of food
		this.protein = copy?food.protein:protein;
		this.carbs = copy?food.carbs:carbs;
		this.fat = copy?food.fat:fat;
		this.calories = copy?food.calories:calories;
		//weight in g if food is not splittable, usually 1
		this.weight = copy?food.weight:weight;
	}
}

class MealItem{
	constructor(item, amount=0, amountMin=0, amountMax=-1){
		let copy = item instanceof MealItem;
		this.food = copy?item.food:item;
		this.amount = copy?item.amount:amount;
		this.amountMin = copy?item.amountMin:amountMin;
		this.amountMax = copy?item.amountMax:amountMax;
	}
	
	get amountUsed(){
		let max = Math.min(this.amount, this.amountMax);
		return Math.max(max>=0?max:this.amount, this.amountMin);
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
	updateFoodInfo(false, index);
}

function onAddFood(){
	let customCheckbox = document.getElementById("foodCustomCheckbox");
	
	let foodCustomName = document.getElementById("foodCustomName");
	let foodProtein = document.getElementById("foodProtein");
	let foodCarbs = document.getElementById("foodCarbs");
	let foodFat = document.getElementById("foodFat");
	let foodCalories = document.getElementById("foodCalories");
	let foodWeight = document.getElementById("foodWeight");
	
	let food = customCheckbox.checked?new Food(foodCustomName.value, foodProtein.value, 
			foodCarbs.value, foodFat.value, foodCalories.value, foodWeight.value):new Food(foods[getFoodSelectIndex()]);
	
	mealItems.push(new MealItem(food));
	
	updateMealTable();
	storeMealCookie();
}

function onFoodDataChange(type, value){
	if(type != "name" && (isNaN(value) || value < 0))
		return;
	let customCheckbox = document.getElementById("foodCustomCheckbox");
	if(!customCheckbox.checked && type == "weight"){
		let food = foods[getFoodSelectIndex()];
		food.weight = value;
	}
	
	if(customCheckbox.checked){
		switch(type){
			case 'name':
				customFood.name = value;
				break;
			case 'protein':
				customFood.protein = value;
				break;
			case 'carbs':
				customFood.carbs = value;
				break;
			case 'fat':
				customFood.fat = value;
				break;
			case 'calories':
				customFood.calories = value;
				break;
			case 'weight':
				customFood.weight = value;
				break;
		}
	}
	updateMealTable();
}

function onMealItem(action, miIndex, value){
	let mi = mealItems[miIndex];
	switch(action){
		case 'amount':
			mi.amount = value;
			break;
		case 'min':
			mi.amountMin = value;
			break;
		case 'max':
			mi.amountMax = value;
			break;
		case 'remove':
			mealItems.splice(miIndex, 1);
			break;
	}
	storeMealCookie();
	updateMealTable();
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

function onCustomToggle(checked){
	let foodSelect = document.getElementById("foodSelect");
	let foodCustomName = document.getElementById("foodCustomName");
	let foodCustomNameLabel = document.getElementById("foodCustomNameLabel");
	
	let foodProtein = document.getElementById("foodProtein");
	let foodCarbs = document.getElementById("foodCarbs");
	let foodFat = document.getElementById("foodFat");
	let foodCalories = document.getElementById("foodCalories");
	let foodWeight = document.getElementById("foodWeight");
	
	foodSelect.style.display = checked?"none":"inline-block";
	foodCustomName.style.display = checked?"inline-block":"none";
	foodCustomNameLabel.style.display = checked?"inline-block":"none";
	
	foodProtein.readOnly = !checked;
	foodCarbs.readOnly = !checked;
	foodFat.readOnly = !checked;
	foodCalories.readOnly = !checked;
	
	updateFoodInfo(checked, foodSelect.selectedIndex);
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
	inp.onkeypress = function(event){ return event.keyCode!=13; };
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

function updateFoodInfo(isCustom, foodIndex){
	let customName = document.getElementById("foodCustomName");
	let protein = document.getElementById("foodProtein");
	let carbs = document.getElementById("foodCarbs");
	let fat = document.getElementById("foodFat");
	let calories = document.getElementById("foodCalories");
	let weight = document.getElementById("foodWeight");
	
	if(isCustom){
		foodCustomName.value = customFood.name;
	}
	
	protein.value = isCustom?customFood.protein:foods[foodIndex].protein;
	carbs.value = isCustom?customFood.carbs:foods[foodIndex].carbs;
	fat.value = isCustom?customFood.fat:foods[foodIndex].fat;
	calories.value = isCustom?customFood.calories:foods[foodIndex].calories;
	weight.value = isCustom?customFood.weight:foods[foodIndex].weight;
}

function addMealTableRow(i){
	let mi = mealItems[i];
	let mealTable = document.getElementById("mealTable");
	let tr = document.createElement("tr");
	
	addTableCell(tr, mi.food.name);
	addTableCellInput(tr, mi.amount, function(){onMealItem('amount', i, this.value);}, "number");
	addTableCellInput(tr, mi.amountMin, function(){onMealItem('min', i, this.value);}, "number");
	addTableCellInput(tr, mi.amountMax, function(){onMealItem('max', i, this.value);}, "number");
	
	let items = [mi.amountUsed, mi.amountGrams, mi.protein, mi.carbs, mi.fat, mi.calories];
	for(let x of items)
		addTableCell(tr, Math.round(x * 100) / 100);
		
	addTableCellButton(tr, "Remove", function(){onMealItem('remove', i);});
		
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

function storeMealCookie(){
	let foodList = [];
	for(let i=0; i<mealItems.length; i++){
		let mi = mealItems[i];
		let data = {
			'food': mi.food,
			'amount': mi.amount,
			'amountMin': mi.amountMin,
			'amountMax': mi.amountMax
		};
		
		foodList.push(data);
	}
	
	setCookie("mealItems", JSON.stringify(foodList), 365);
}

function loadMealCookie(){
	let items = JSON.parse(readCookie("mealItems"));
	if(items == null)
		return;
	for(let i of items){
		mealItems.push(new MealItem(i.food, i.amount, i.amountMin, i.amountMax));
	}
}

function storeGoalCookie(){
	setCookie("goals", JSON.stringify(goals), 365);
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
	storeMealCookie();
}


window.onload = function(){
	initFoods();
	loadMealCookie();
	loadGoalCookie();
	initFoodSelect();
	updateFoodInfo(false, getFoodSelectIndex());
	updateMealTable();
	updateDeltaTable();
};
