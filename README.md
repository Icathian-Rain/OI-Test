# OI-Test

# 0. 介绍

自动化OI生成，编译，评测工具



# 1. 特点

## 1.1 自动生成

可通过模板自动生成oi做题所需的文件 (以C++为例)

- (problem).cpp : 源代码，由pattern.cpp生成
- (problem).in    : 样例输入文件
- (problem).ans : 样例答案文件

通过`config.py`中configs['compile_command'] 指定语言的pattern模板

```python
configs = {
    'patterns' : {
        'c' : 'pattern.c',
        'cpp' : 'pattern.cpp',
    } 
}
```

## 1.2 自动编译

通过`config.py`中configs['compile_command'] 指定语言编译器参数进行自动编译

```python
configs = {
    'compile_command' : {
        'c' : 'gcc {problem}.c -o {problem}.exe',
        'cpp' : 'g++ {problem}.cpp -o {problem}.exe -DONLINE_JUDGE -Wall -fno-asm -lm -march=native',
    }
}
```

## 1.3 自动评测

通过管道将输入文件传入可执行程序，再通过管道输出临时输出文件`(problem).out`

```python
begin = time.time()
ret = os.system(problem + '.exe < ' + problem +
                '.in > ' + problem + '.out')
end = time.time()
logger.info('Used Time: {0:.3f}s'.format(end - begin))
```

同时输出程序运行时长

将程序输出与答案进行比对，获取评测结果

```python
s = '.'.join(os.popen('diff ' + problem + '.out ' + problem + '.ans').readlines())
```

# 2. 配置信息

- oitest.py: 主程序

  - ```bash
    usage: oitest.py [-h] [-l LANGUAGE] [-d DIRECTORY] [-t] problem
    
    OI Test
    
    positional arguments:
      problem               Problem ID
    
    optional arguments:
      -h, --help            show this help message and exit
      -l LANGUAGE, --language LANGUAGE
                            Language
      -d DIRECTORY, --directory DIRECTORY
                            Directory
      -t, --test            Test
    ```

  - 

- config.py: 配置文件夹

  - ```python
    configs = {
        'default_dir' : 'Luogu',
        'default_language' : 'cpp',
        'patterns' : {
            'c' : 'pattern.c',
            'cpp' : 'pattern.cpp',
        }, 
        'compile_command' : {
            'c' : 'gcc {problem}.c -o {problem}.exe',
            'cpp' : 'g++ {problem}.cpp -o {problem}.exe -DONLINE_JUDGE -Wall -fno-asm -lm -march=native',
        },
    }
    ```

  - 

- log.txt: 输出日志

- pattern.* : 对应语言的模板文件

- Luogu: 样例文件夹

# 3. 使用方法

1. 生成题目对应文件:

   ```bash
   python oitest.py (problem)
   ```

   如：

   ```python
   python oitest.py 1001
   ```

2. 在对应文件内，填入题目相关信息

   1. problem.in 	: 样例输入
   2. problem.ans  : 样例结果
   3. problem.cpp : 源代码

3. 自动评测:

   ```bash
   python oitest.py problem -t
   ```

   如

   ```bash
   python oitest.py 1001 -t
   ```

   
