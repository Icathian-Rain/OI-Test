import argparse
import os
from config import configs
import logging
import time 

logger = logging.getLogger(name='r')  # 不加名称设置root logger

# 处理输出文件，将文件结尾的空行去掉
def process_file(file_name):
    with open(file_name, 'r') as f:
        lines = f.readlines()
    # 去掉最后的空行
    lines[-1] = lines[-1].rstrip('\n')
    with open(file_name, 'w') as f:
        f.writelines(lines)


def logger_init():
    global logger
    logger.setLevel(logging.DEBUG)
    formatter = logging.Formatter(
        '%(levelname)s: - %(message)s')
    fh = logging.FileHandler('log.txt', mode='w')
    fh.setLevel(logging.INFO)
    fh.setFormatter(formatter)

    # 使用StreamHandler输出到屏幕
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    ch.setFormatter(formatter)

    # 添加两个Handler
    logger.addHandler(ch)
    logger.addHandler(fh)


def parser_args():
    parser = argparse.ArgumentParser(description='OI Test')
    parser.add_argument('problem', help='Problem ID')
    parser.add_argument('-l', '--language', help='Language',
                        default=configs['default_language'])
    parser.add_argument('-d', '--directory', help='Directory',
                        default=configs['default_dir'])
    parser.add_argument('-t', '--test', help='Test', action='store_true')

    args = parser.parse_args()
    return args

# 读取pattern


def get_pattern(pattern_file):
    with open(pattern_file, 'r') as f:
        pattern = f.read()
    return pattern

# 新建题目文件夹


def new(problem, language, pattern):
    if not os.path.exists(problem):
        os.mkdir(problem)
    os.chdir(problem)
    # 写入pattern
    if language == 'cpp':
        if not os.path.exists(problem + '.cpp'):
            with open(problem + '.cpp', 'w') as f:
                f.write(pattern)

    # 创建测试数据文件
    if not os.path.exists(problem + '.in'):
        with open(problem + '.in', 'w') as f:
            pass

    # 创建答案数据文件
    if not os.path.exists(problem + '.ans'):
        with open(problem + '.ans', 'w') as f:
            pass
    logger.info('New Problem {0} Success!'.format(problem))


# 编译
def compile(problem, language):
    compile_command = configs['compile_command'][language]
    # 编译
    ret = os.system(compile_command.format(problem=problem))
    # 判断是否编译成功
    if ret:
        logger.error('Compile Error!')
        exit(1)
    else:
        logger.info('Compile Success!')


def test(problem):
    # 运行程序
    begin = time.time()
    ret = os.system(problem + '.exe < ' + problem +
                    '.in > ' + problem + '.out')
    end = time.time()
    logger.info('Used Time: {0:.3f}s'.format(end - begin))

    if ret:
        logger.error('Runtime Error!')
        exit(1)
    else:
        logger.info('Runtime Success!')
    # 处理输出文件
    process_file(problem + '.out')
    # 处理答案文件
    process_file(problem + '.ans')
    # 比较输出数据和答案数据
    diff_command = configs['diff_command'].format(problem=problem)
    s = os.system(diff_command)
    if s == 0:
        logger.info('Accepted!')
    else:
        logger.error('Wrong Answer!')  
    # 删除可执行程序
    if os.path.exists(problem + '.exe'):
        os.remove(problem + '.exe')


def main():
    parser = parser_args()
    logger_init()
    # 获取pattern
    pattern = get_pattern(configs['patterns'][parser.language])

    # 切换到工作目录
    if not os.path.exists(parser.directory):
        os.mkdir(parser.directory)
    os.chdir(parser.directory)
    # 创建新文件, 非测试模式
    if not parser.test:
        new(parser.problem, parser.language, pattern)
    # 编译并测试, 测试模式
    if parser.test:
        os.chdir(parser.problem)
        compile(parser.problem, parser.language)
        test(parser.problem)


if __name__ == '__main__':
    main()
