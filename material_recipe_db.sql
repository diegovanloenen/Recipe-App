-- phpMyAdmin SQL Dump
-- version 3.4.5
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Feb 21, 2016 at 03:21 PM
-- Server version: 5.5.16
-- PHP Version: 5.3.8

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `material_recipe_demo`
--

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE IF NOT EXISTS `category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `banner` text NOT NULL,
  `description` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique` (`name`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=8 ;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `name`, `banner`, `description`) VALUES
(1, 'Appetizers', 'category_Appetizers.jpg', 'Lorem ipsum dolor sit amet, consectetur adipiscing'),
(2, 'Main Dish', 'category_Main Dish.jpg', 'Lorem ipsum dolor sit amet, consectetur adipiscing');

-- --------------------------------------------------------

--
-- Table structure for table `gcm`
--

CREATE TABLE IF NOT EXISTS `gcm` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `device` varchar(100) NOT NULL,
  `email` varchar(50) NOT NULL,
  `version` varchar(100) NOT NULL,
  `regid` varchar(500) NOT NULL,
  `date_create` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_regid` (`regid`),
  UNIQUE KEY `unique_device` (`device`,`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=20 ;

-- --------------------------------------------------------

--
-- Table structure for table `recipe`
--

CREATE TABLE IF NOT EXISTS `recipe` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `instruction` text NOT NULL,
  `duration` int(11) NOT NULL,
  `image` text NOT NULL,
  `category` int(11) NOT NULL,
  `date_create` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_name` (`name`),
  KEY `recipe_fk1` (`category`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=53 ;

--
-- Dumping data for table `recipe`
--

INSERT INTO `recipe` (`id`, `name`, `instruction`, `duration`, `image`, `category`, `date_create`) VALUES
(20, 'Superfood Tapenade', '<p>\n			<b>1</b> In a Dutch oven or other large, lidded pot, melt the butter over medium-high heat. Add enough pieces of the beef to sear in the pot without crowding.\n		</p> </br>\n        <p>\n			<b>2</b> When all the beef has browned, add the onions. Sprinkle a little salt over the onions as they cook. Lower the heat to medium and cook the onions until they begin to brown, <b>5-6 minutes</b>.\n		</p> </br>\n        <p>\n			<b>3</b> When the onions have lightly browned, mix in the mushrooms and increase the heat to high. Cook the mushrooms until they release their water, about <b>2-3 minutes</b>.\n		</p> </br>\n        <p>\n			<b>4</b> Add the beef back to the pot and sprinkle with marjoram. <b>Add 1 cup</b> of the stock and use the wooden spoon to scrape any browned bits off the bottom of the pot. Add the rest of the stock and water and bring to a simmer.\n		</p> </br>\n        <p>\n		<b>5</b> Add the barley, celery root and carrots, stir well and recover the pot. Simmer gently until the barley and celery root are tender, between 40 minutes and an hour.\n		</p>', 4, 'recipe_Superfood Tapenade.jpg', 1, 1451987673860),
(21, 'Garlic Bokchoy', '<p>\n			<b>1</b> In a Dutch oven or other large, lidded pot, melt the butter over medium-high heat. Add enough pieces of the beef to sear in the pot without crowding.\n		</p> </br>\n        <p>\n			<b>2</b> When all the beef has browned, add the onions. Sprinkle a little salt over the onions as they cook. Lower the heat to medium and cook the onions until they begin to brown, <b>5-6 minutes</b>.\n		</p> </br>\n        <p>\n			<b>3</b> When the onions have lightly browned, mix in the mushrooms and increase the heat to high. Cook the mushrooms until they release their water, about <b>2-3 minutes</b>.\n		</p> </br>\n        <p>\n			<b>4</b> Add the beef back to the pot and sprinkle with marjoram. <b>Add 1 cup</b> of the stock and use the wooden spoon to scrape any browned bits off the bottom of the pot. Add the rest of the stock and water and bring to a simmer.\n		</p> </br>\n        <p>\n		<b>5</b> Add the barley, celery root and carrots, stir well and recover the pot. Simmer gently until the barley and celery root are tender, between 40 minutes and an hour.\n		</p>', 10, 'recipe_Garlic Bokchoy.jpg', 1, 1451987777995),
(25, 'Beef Mechado', '<p>\n	<b>1</b> In a Dutch oven or other large, lidded pot, melt the butter over medium-high heat. Add enough pieces of the beef to sear in the pot without crowding.\n</p> </br>\n<p>\n	<b>2</b> When all the beef has browned, add the onions. Sprinkle a little salt over the onions as they cook. Lower the heat to medium and cook the onions until they begin to brown, <b>5-6 minutes</b>.\n</p> </br>\n<p>\n	<b>3</b> When the onions have lightly browned, mix in the mushrooms and increase the heat to high. Cook the mushrooms until they release their water, about <b>2-3 minutes</b>.\n</p> </br>\n<p>\n	<b>4</b> Add the beef back to the pot and sprinkle with marjoram. <b>Add 1 cup</b> of the stock and use the wooden spoon to scrape any browned bits off the bottom of the pot. Add the rest of the stock and water and bring to a simmer.\n</p> </br>\n<p>\n<b>5</b> Add the barley, celery root and carrots, stir well and recover the pot. Simmer gently until the barley and celery root are tender, between 40 minutes and an hour.\n</p>', 5, 'recipe_Beef Mechado.jpg', 2, 1451988356906);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `username` varchar(20) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_username` (`username`),
  UNIQUE KEY `unique_email` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=15 ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `password`) VALUES
(1, 'User', 'user_recipe', 'user@mail.com', 'ee11cbb19052e40b07aac0ca060c23ee');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `recipe`
--
ALTER TABLE `recipe`
  ADD CONSTRAINT `recipe_fk1` FOREIGN KEY (`category`) REFERENCES `category` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
