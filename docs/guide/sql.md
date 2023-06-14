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

### 基础指令

where：查询条件，比如 where id=1
as：别名，比如 select xxx as 'yyy'
and: 连接多个条件
or: 只需要一个条件成立
in/not in：集合查找，比如 where a in (1,2)
between and：区间查找，比如 where a between 1 and 10
limit：分页，比如 limit 0,5
order by：排序，可以指定先根据什么升序、如果相等再根据什么降序，比如 order by a desc,b asc
group by：分组，比如 group by aaa
having：分组之后再过滤，比如 group by aaa having xxx > 5
distinct：去重

### 内置函数

聚合函数：avg、count、sum、min、max
字符串函数：concat、substr、length、upper、lower
数值函数：round、ceil、floor、abs、mod
日期函数：year、month、day、date、time
条件函数：if、case
系统函数：version、datebase、user
类型转换函数：convert、cast、date_format、str_to_date
其他函数：nullif、coalesce、greatest、least

## 一对一、一对多

### JOIN 查询

从表使用主表的ID 作为外键进行关联查, 语法是JOIN ON
`SELECT * FROM user JOIN id_card ON user.id = id_card.user_id;`
JOIN ON 其实默认是 INNER JOIN ON, 只返回有关联的数据,
LEFT JOIN 会额外返回左表中没有关联上的数据。
RIGHT JOIN 会额外返回右表中没有关联上的数据。

### 级联查询方式

CASCADE： 主表主键更新，从表关联记录的外键跟着更新，主表记录删除，从表关联记录删除
SET NULL：主表主键更新或者主表记录删除，从表关联记录的外键设置为 null
RESTRICT：只有没有从表的关联记录时，才允许删除主表记录或者更新主表记录的主键 id
NO ACTION： 同 RESTRICT，只是 sql 标准里分了 4 种，但 mysql 里 NO ACTION 等同于 RESTRICT。

## 多对多

一般用中间表处理, 中间表存多方的外键
中间表级联方式必须是 CASCADE
关联查询就是JOIN 多个表

## 子查询、EXISTS

多个sql 合并

```sql
-- 查询学生表里的最高分
SELECT MAX(score) FROM student;
-- 查询最高分学生的姓名和班级名称
SELECT name, class FROM student WHERE score = 95;
-- 合并sql, 子查询
SELECT name, class FROM student WHERE score = (SELECT MAX(score) FROM student);
```

关键字 EXISTS（和 NOT EXISTS），当子查询有返回结果的时候成立，没有返回结果的时候不成立。

```sql
-- 对每个 department，在子查询里查询它所有的 employee。
-- department.id = employee.department_id代表数据存在, 返回department 表里对应的name
-- 这就是 EXISTS 的作用：子查询返回结果，条件成立，反之不成立。
-- NOT EXISTS就是反过来, 把条件不存在的返回

SELECT name FROM department
    WHERE EXISTS (
        SELECT * FROM employee WHERE department.id = employee.department_id
    );
```

## 事务和隔离级别

事务内的几条 sql 要么全部成功，要么全部不成功，这样能保证数据的一致性
START TRANSACTION 开启事务
ROLLBACK 回滚事务
COMMIT 提交后不能回滚
SAVEPOINT xx 设置保存的点, 在一段事务中可以设置多个
ROLLBACK TO SAVEPOINT xx; 回滚到指定保存点

### 事务隔离

MYSQL 有 4 种事务隔离级别：

READ UNCOMMITTED：可以读到别的事务尚未提交的数据。
这就有个问题，你这个事务内第一次读的数据是 aaa，下次读可能就是 bbb 了，这个问题叫做不可重复读。

而且，万一你读到的数据人家又回滚了，那你读到的就是临时数据，这个问题叫做脏读。

READ COMMITTED：只读取别的事务已提交的数据。
这样是没有脏读问题了，读到的不会是临时数据。

但是还是有可能你这个事务内第一次读的数据是 aaa，下次读可能是 bbb ，也就是不可重复读的问题依然存在。

不只是数据不一样，可能你两次读取到的记录行数也不一样，这叫做幻读。

REPEATABLE READ：在同一事务内，多次读取数据将保证结果相同。
这个级别保证了读取到的数据一样，但是不保证行数一样，也就是说解决了不可重复读的问题，但仍然存在幻读的问题。

SERIALIZABLE：在同一时间只允许一个事务修改数据。
事务一个个执行，各种问题都没有了。

但是负面影响就是性能很差，只能一个个的事务执行。

这 4 种级别主要是数据一致性和性能的差别，一致性越好，并发性能就越差。

## 视图，存储过程和函数

- 不建议在生产使用
