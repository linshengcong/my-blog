# SQL

## SQL 语句(CRUD)

### 建表

```sql
CREATE TABLE `student` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `name` varchar(45) NOT NULL COMMENT '名字',
  `age` int DEFAULT NULL COMMENT '年龄',
  `sex` int DEFAULT NULL COMMENT '性别',
  `email` varchar(60) DEFAULT NULL COMMENT '邮箱',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `status` int DEFAULT '0' COMMENT '是否删除',
  PRIMARY KEY (`id`)
);
```

```sql
INSERT INTO `student` (`name`, `age`, `sex`, `email`, `create_time`) VALUES ('someone', '23', '1', 'someone@qq.com', '2023-05-27 10:50:00');
```

```sql
UPDATE `exaple-mysql`.`student` SET `email` = 'xxx@qq.com' WHERE (`id` = '2');
```

```sql
DELETE FROM `exaple-mysql`.`student` WHERE (`id` = '2');
```
